// SporeDrop/main.go
package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// userID -> last request timestamp
var lastSeen = make(map[string]time.Time)

// create context memory map
var memoryStore = make(map[string][]Message)

// incoming message structure
type ChatInput struct {
	UserID  string `json:"user"` // from discord or internal systems
	Message string `json:"message"`
}

// outgoing reply structure
type ChatOutput struct {
	Reply string `json:"reply"`
}

type MistralRequest struct {
	Messages    []Message `json:"messages"`
	Temperature float32   `json:"temperature"`
	Stream      bool      `json:"stream"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MistralResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found; using system env vars")
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("chatbot API running on :" + port)

	router := gin.Default()
	router.POST("/chat", handleChat)
	router.Run(":" + port)

}

func handleChat(c *gin.Context) {
	var input ChatInput
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// validate input
	if input.UserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user ID"})
		return
	}

	now := time.Now() // rate limiter 3s cooldown
	if last, ok := lastSeen[input.UserID]; ok && now.Sub(last) < 3*time.Second {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded."})
		return
	}
	lastSeen[input.UserID] = now

	// store user message in memory and ignore blank strings
	trimmed := strings.TrimSpace(input.Message)
	if trimmed != "" {
		memoryStore[input.UserID] = append(memoryStore[input.UserID], Message{
			Role:    "user",
			Content: input.Message,
		})
	}

	reply, err := callMistral(input.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Mistral error"})
		return
	}

	// store bot reply in memory after trimming blank strings
	if trimmed := strings.TrimSpace(reply); trimmed != "" {
		memoryStore[input.UserID] = append(memoryStore[input.UserID], Message{
			Role:    "assistant",
			Content: reply,
		})
	}

	c.JSON(http.StatusOK, ChatOutput{Reply: reply})
}

func trimMemory(messages []Message, limit int) []Message {
	if len(messages) <= limit {
		return messages
	}
	return messages[len(messages)-limit:]
}

func callMistral(userID string) (string, error) {
	mistralURL := os.Getenv("MISTRAL_URL")
	bearerToken := os.Getenv("MISTRAL_TOKEN") // this is safer than hardcoding

	if mistralURL == "" || bearerToken == "" {
		log.Fatal("Missing MISTRAL_URL or MISTRAL_TOKEN in .env")
	}

	history := trimMemory(memoryStore[userID], 5)
	payload := MistralRequest{
		Messages:    history, // use context window memory
		Temperature: 0.7,
		Stream:      false,
	}

	jsonData, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", mistralURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+bearerToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	log.Printf("Mistral response body: %s", body)

	var result MistralResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	if len(result.Choices) > 0 {
		return result.Choices[0].Message.Content, nil
	}

	return "{no reply}", nil
}
