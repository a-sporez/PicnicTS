# PicnicJS

Node.js plugin-hosting backend with Go chatbot microservice.

Currently the system serves as a modular event-based architecture bridging Discord, custom LLM APIs (e.g., Mistral), and internal plugin logic. It is tested with DigitalOcean's Mistral Nemo Instruct model but adaptable to others. Main interfaces are Express and internal event buses.

**DOTENV Variables need to be created to authorize**

## Component Design Blueprint

                       +-------------------------+
                       |      Frontend App       |
                       |         (Vite)          |
                       +-----------+-------------+
                                   |
                        HTTPS/API Calls / WebSocket
                                   ↓
           +----------------------↓----------------------+
           |                  API Gateway                |
           |          express-rate-limit + proxy         |
           +----------------------↓----------------------+
                        Auth Headers (JWT from Keycloak)
                                   ↓
                       +----------↓-----------+
                       |   Module Host (API)  |
                       |   main.ts            |
                       +--+-----+------+------+
                          |     |      |
                          ↓     ↓      ↓
               +----------+ +----------+ +-------------+
               | StreamCfg | | ClientCfg| | ChatModule |
               | Service   | | Service  | | EmoteMod   |
               +-----+-----+ +-----+----+ +------+------+
                     |             |             |
                     ↓             ↓             ↓
               Redis Cloud     PostgreSQL     In-memory/Redis

                   ⬑ Shared Redis Pub/Sub Queue (event bus)

                          +-------------------+
                          |  Keycloak Server  |
                          | (OAuth2 + RBAC)   |
                          +-------------------+

---

## Component Map

```
root
├── main.js                  # Starts plugin system & emits test events
├── server.js                # Express API for injecting events
├── /core
│   ├── context.js           # Defines the shared event context
│   ├── event_bus.js         # Handles publish/subscribe logic
│   └── plugin_manager.js    # Dynamically loads plugin modules
├── /plugins
│   ├── chat_module          # In-memory chat log, rebroadcasts messages
│   ├── client_config        # Stores config per clientId, triggers updates
│   ├── discord_bridge       # Receives/sends Discord messages as events
│   ├── emote_module         # Rewrites messages with emojis from :codes:
│   ├── greeter              # Simple hello-world plugin for testing
│   ├── mistral_bridge       # Routes Discord chat to chatbot API and back
│   └── stream_config        # Manages stream metadata (title, tags, live flag)
└── /SporeDrop
    └── main.go              # Mistral chatbot backend (Go) with context memory
```

---

## Technologies and Tools

| Layer             | Stack / Tools                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Frontend**      | (Optional) External apps that hit `/events/incoming`                                                |
| **Auth**          | Discord bot token (.env), no centralized auth yet                                                   |
| **Backend**       | Node.js, Express, plugin system                                                                     |
| **Plugins**       | `chat_module`, `emote_module`, `mistral_bridge`, `discord_bridge`, `stream_config`, `client_config` |
| **Database**      | In-memory with optional Redis/DB later                                                              |
| **Communication** | Event bus (internal pub/sub), HTTP injection via Express                                            |
| **Rate Limits**   | Mistral backend includes simple user cooldown logic                                                 |
| **Storage**       | None yet – chat/config/plugins are all ephemeral                                                    |


**DOCUMENTATION IS INCOMPLETE**

---

[SporeDrop](/documentation/SporeDrop.md)

[Module Host](/documentation/module_host.md)
