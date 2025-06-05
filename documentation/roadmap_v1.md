# Roadmap v1

A realistic, incremental plan that turns the current codebase into a **Keycloak-secured, plugin-driven streaming toolkit** with a live Astro dashboard.

---

## 0 — House-keeping & Guard-rails

| Task | Why now? | How |
|------|----------|-----|
| **Type-safe event schema** | Catch typos early. | Add `/core/event_types.js` (or `.d.ts`) enumerating allowed `type` strings and throw on unknown events. |
| **`.env.example` + pre-flight check** | Prevent “works-on-my-machine” bugs. | Ship sample env file; exit in `main.js` if required vars are missing. |
| **Structured logger wrapper** | Consistent JSON logs for later aggregation. | Thin wrapper around `pino` or `winston`; inject via `context.logger`. |

---

## 1 — Authentication Façade

**Goal:** All HTTP entry points validate a Keycloak JWT (or a pre-shared Discord/Twitch token) before emitting events.

1. Spin up Keycloak via Docker (Quarkus image).  
2. Add `keycloak-connect` or `express-jwt` middleware in `server.js`.  
3. Pass `req.auth` into `context.user` when emitting events so plugins *may* inspect it.

---

## 2 — Persistence Layer Abstractions

**Goal:** Replace in-memory objects with Redis behind a thin interface.

1. Create `/core/store.js` exporting helpers (`chatLog`, `clientConfig`, `streamConfig`).
2. Refactor **only** `chat_module` and `client_config` to use the store.
3. Unit-test the store with `redis-mock`.

---

## 3 — External-Service Bridges

| Bridge plugin | MVP events | Notes |
|---------------|-----------|-------|
| `twitch_bridge` | `twitch::chat:received`, `twitch::follow`, `twitch::message:send` | Start with EventSub webhooks. |
| `youtube_bridge` | `yt::chat:received`, `yt::superchat`, `yt::message:send` | Begin with polling live-chat REST. |

Pattern: **translate only**; never call other plugins directly.

---

## 4 — WebSocket / SSE Fan-out

Add `socket.io` (or SSE) in `server.js`.  
Broadcast every event from the central `event_bus.subscribe` to connected dashboard clients.

---

## 5 — Astro Dashboard Skeleton (+ Keycloak login)

1. `pnpm create astro@latest dashboard` → `/frontend`.  
2. Implement an island that:
   * swaps Keycloak token for the socket connection,
   * streams `chat::message:emoted` feed,
   * shows current `stream_config` & a “go live” button (emits `stream::config:update`).

---

## 6 — Operational Polish

* **docker-compose** for Node host, Go `SporeDrop`, Redis, Keycloak.  
* `/healthz` and `/readyz` endpoints.  
* CI checks (`npm test`, `go test ./...`).  
* Typedoc / Go doc generation under `npm run docs`.

---

### Why this order?

1. **Auth first** – everything else builds on it.  
2. **State next** – Redis enables horizontal scaling.  
3. **Bridges** – independent; deliver user value quickly.  
4. **Realtime feed** – unblocks UI work.  
5. **UI** – consumes stable auth & data contracts.  
6. **Polish** – continuous hardening once basics work.

---

## Quick wins for “Keycloak = external-service wrapper”

* **Service accounts:** one Keycloak client per external platform (Discord, Twitch).  
* **User federation later:** map Discord IDs → Keycloak users for RBAC without refactoring events.

---
