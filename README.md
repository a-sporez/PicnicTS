# PicnicJS
Modern JS plugin-based web app.

## Component Map

                       +-------------------------+
                       |      Frontend App       |
                       |    (Next.js + SWR)      |
                       +-----------+-------------+
                                   |
                        HTTPS/API Calls / WebSocket
                                   ↓
           +----------------------↓----------------------+
           |                 API Gateway (optional)      |
           |      (e.g., express-rate-limit + proxy)     |
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

## Technologies and Tools

| Layer             | Stack / Tools                                    |
| ----------------- | ------------------------------------------------ |
| **Frontend**      | Next.js, Tailwind CSS, SWR (data), WebSockets    |
| **Auth**          | Keycloak (OIDC/JWT), OAuth2.1 compatible flows   |
| **Backend**       | Node.js (TypeScript), Modular Plugin Loader      |
| **Plugins**       | `Command`, `Emote`, `StreamConfigService`, etc.  |
| **Database**      | Redis (stream/user state), PostgreSQL (optional) |
| **Communication** | WebSocket or Redis Pub/Sub                       |
| **Rate Limits**   | `express-rate-limit`, or Cloudflare WAF          |
| **Storage**       | Optional: S3/Cloudflare R2 for plugin uploads    |
