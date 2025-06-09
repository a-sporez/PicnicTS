---
layout: ../layouts/DocsLayout.astro
current: "/sporedrop/"
---
# SporeDrop – TypeScript-Compatible Reference Guide

---

## Purpose

This Go module acts as a **middleware service** between a chat client (e.g., Discord) and the **Mistral LLM API**, enabling contextual, rate-limited interactions via HTTP requests.

Its output is formatted to match the expectations of the TypeScript plugin system and emits events compatible with `mistral_bridge`.

---

## Core Components

### 1. Dependencies

```go
"github.com/gin-gonic/gin"
"github.com/joho/godotenv"
```

* `gin`: lightweight web framework for routing HTTP requests
* `godotenv`: loads environment variables from `.env` file

---

## Data Structures

### ➤ `ChatInput`

```go
type ChatInput struct {
  UserID  string `json:"user"`
  Message string `json:"message"`
}
```

* Represents incoming request payload
* `UserID` is required for context memory and rate limiting

### ➤ `ChatOutput`

```go
type ChatOutput struct {
  Reply string `json:"reply"`
}
```

* Response structure returned to the caller

### ➤ `Message`

```go
type Message struct {
  Role    string `json:"role"`
  Content string `json:"content"`
}
```

* Used internally for context memory and sent to Mistral API

### ➤ `MistralRequest` & `MistralResponse`

```go
type MistralRequest struct {
  Messages    []Message
  Temperature float32
  Stream      bool
}
```

```go
type MistralResponse struct {
  Choices []struct {
    Message struct {
      Content string
    }
  }
}
```

* Used to format Mistral API requests and decode responses

---

## Global State

### ➤ `memoryStore`

```go
var memoryStore = make(map[string][]Message)
```

* Per-user memory used for context window

### ➤ `lastSeen`

```go
var lastSeen = make(map[string]time.Time)
```

* Tracks last request timestamp per user (cooldown enforcement)

---

## Initialization

### ➤ `init()`

```go
func init() {
  godotenv.Load()
}
```

* Loads configuration from `.env`

### ➤ `main()`

```go
router.POST("/chat", handleChat)
```

* Launches server on `PORT` (default: 8080)
* Accepts structured chat inputs

---

## Endpoint Logic

### ➤ `handleChat(c *gin.Context)`

1. Validates payload (requires non-empty `UserID` and `Message`)
2. Applies rate limit (3s cooldown)
3. Appends user message to context memory
4. Calls `callMistral()` with trimmed memory
5. Stores assistant reply
6. Returns `{ "reply": "..." }`

---

## Utility: Trim Memory

### ➤ `trimMemory()`

```go
func trimMemory(messages []Message, limit int) []Message
```

* Retains only most recent messages (default: 5–20)

---

## LLM Call

### ➤ `callMistral(userID string)`

1. Trims memory
2. Constructs `MistralRequest`
3. Sends request using bearer token
4. Returns `reply` string from first `Choices[0].Message.Content`

---

## Environment Variables

These must be defined in `.env`:

```
PORT=8080
MISTRAL_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_TOKEN=your_mistral_api_key
```

---

## Example Request

### Request

```json
POST /chat
Content-Type: application/json

{
  "user": "123456",
  "message": "What's the weather like on Mars?"
}
```

### Response

```json
{
  "reply": "It’s dry and dusty as usual. Bring sunscreen!"
}
```

---

## Protections Implemented

| Feature        | Behavior                               |
| -------------- | -------------------------------------- |
| Rate Limiter   | 3 seconds per user (`lastSeen`)        |
| Memory Control | Memory trimmed per user (`trimMemory`) |
| Input Check    | Rejects if `UserID` is missing         |
