# SporeDrop Chatbot Module – Reference Guide

---

## 🔹 Purpose

This Go module acts as a **middleware service** between a chat client (e.g., Discord) and the **Mistral LLM API**, enabling contextual, rate-limited interactions via HTTP requests. It supports:

* In-memory user-specific message context
* JSON-based chat inputs and outputs
* Call delegation to a hosted Mistral endpoint
* Rate-limiting per user to prevent abuse

---

### 📁 Core Components

#### 1. **Dependencies**

```go
"github.com/gin-gonic/gin"
"github.com/joho/godotenv"
```

* `gin`: lightweight web framework for routing HTTP requests
* `godotenv`: loads environment variables from `.env` file

---

### 📦 Data Structures

#### ➤ `ChatInput`

```go
type ChatInput struct {
	UserID  string `json:"user"`
	Message string `json:"message"`
}
```

* Represents the incoming request payload from a client (e.g., a Discord message)
* `UserID` is required to track memory per-user

#### ➤ `ChatOutput`

```go
type ChatOutput struct {
	Reply string `json:"reply"`
}
```

* Encapsulates the chatbot’s textual response

#### ➤ `Message`

```go
type Message struct {
	Role    string `json:"role"`     // "user", "assistant", "system"
	Content string `json:"content"`  // actual message text
}
```

* Used for memory and LLM API payloads
* Stored and sent in role-based history for context

#### ➤ `MistralRequest` & `MistralResponse`

```go
type MistralRequest struct {
	Messages    []Message
	Temperature float32
	Stream      bool
}
```

* Mistral-compatible prompt object using user context

```go
type MistralResponse struct {
	Choices []struct {
		Message struct {
			Content string
		}
	}
}
```

* Minimal structure to parse a response from Mistral

---

### 🗂 Global State

#### ➤ `memoryStore`

```go
var memoryStore = make(map[string][]Message)
```

* Stores per-user chat memory in memory, used as conversation context

#### ➤ `lastSeen`

```go
var lastSeen = make(map[string]time.Time)
```

* Stores timestamp of each user's last message to throttle frequency

---

### ⚙️ Initialization Logic

#### ➤ `init()`

```go
func init() {
	godotenv.Load()
}
```

* Loads `.env` values (e.g., `MISTRAL_URL`, `MISTRAL_TOKEN`, `PORT`)

#### ➤ `main()`

```go
router.POST("/chat", handleChat)
```

* Starts a web server on `PORT` (default: 8080)
* Defines one endpoint: `POST /chat`

---

### 🚦 Endpoint Handler

#### ➤ `handleChat(c *gin.Context)`

Processes all chat events. Key steps:

1. ✅ Validate request body & `UserID`
2. 🚫 Apply 3-second per-user rate limit via `lastSeen`
3. 🧠 Append user's message to their memory
4. 🤖 Send memory to Mistral API and retrieve reply
5. 📥 Store assistant reply in memory
6. 🔁 Return reply as JSON

---

### 🧹 Utility: Trim Memory

#### ➤ `trimMemory()`

```go
func trimMemory(messages []Message, limit int) []Message
```

* Keeps only the last `limit` messages per user
* Used to prevent memory overgrowth

---

### 🤖 LLM Call

#### ➤ `callMistral(userID string)`

1. Trims user memory to 20 messages
2. Constructs a `MistralRequest`
3. Makes an authenticated `POST` request to Mistral API
4. Parses `Choices[0].Message.Content` as final reply

---

### 📄 .env Required Variables

Make sure the following exist in your `.env`:

```
PORT=8080
MISTRAL_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_TOKEN=your_mistral_api_key
```

---

### 🧱 Example Request

#### Request

```json
POST /chat
Content-Type: application/json

{
  "user": "123456",
  "message": "What's the weather like on Mars?"
}
```

#### Response

```json
{
  "reply": "It’s dry and dusty as usual. Bring sunscreen!"
}
```

---

### 🔐 Protections Implemented

| Feature        | Behavior                            |
| -------------- | ----------------------------------- |
| Rate Limiter   | 3 seconds per user (via `lastSeen`) |
| Memory Control | Trimmed to last 20 messages         |
| Input Check    | Rejects if `UserID` is missing      |

---
