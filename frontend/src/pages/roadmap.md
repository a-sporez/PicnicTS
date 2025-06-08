# Roadmap v1 – TypeScript Plugin Host

A realistic, incremental plan that turns the current **TypeScript + Yarn v4** codebase into a **Keycloak-secured, plugin-driven streaming toolkit** with a live Astro dashboard.

---

## 0 — House-keeping & Refactoring

**Refactor 0-15 Goals**

- Finish CJS→ESM conversion for all plugins
- Switch from require to dynamic import(), with error and logger.
- Centralize sporedrop server to global interface for other LLM services.
- Structured Logger Wrapper.

---

## 1 — Authentication Façade

**Goal:** All HTTP entry points validate a Keycloak JWT (or a pre-shared Discord/Twitch token) before emitting events.

1. Spin up Keycloak via Docker (Quarkus image).
2. Add `express-jwt` or Keycloak middleware in `server.ts`.
3. Pass `req.auth` into `context.user` when emitting events so plugins *may* inspect it.

---

## 2 — Persistence Layer Abstractions

**Goal:** Replace in-memory objects with Redis behind a thin interface.

1. Create `/core/store.ts` exporting helpers (`chatLog`, `clientConfig`, `streamConfig`).
2. Refactor **only** `chat_module` and `client_config` to use the store.
3. Unit-test the store with `redis-mock` or local dev mode.

---

## 3 — External-Service Bridges

| Bridge plugin    | MVP events                                                        | Notes                              |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------- |
| `twitch_bridge`  | `twitch::chat:received`, `twitch::follow`, `twitch::message:send` | Start with EventSub webhooks.      |
| `youtube_bridge` | `yt::chat:received`, `yt::superchat`, `yt::message:send`          | Begin with polling live-chat REST. |

Pattern: **translate only**; never call other plugins directly.

---

## 4 — WebSocket / SSE Fan-out

Add `socket.io` (or SSE) in `server.ts`.
Broadcast every event from the central `EventBus.subscribe` to connected dashboard clients.

---

## 5 — Astro Dashboard Skeleton (+ Keycloak login)

1. `pnpm create astro@latest dashboard` → `/frontend`.
2. Implement an island that:

   * swaps Keycloak token for the socket connection,
   * streams `chat::message:emoted` feed,
   * shows current `stream_config` & a “go live” button (emits `stream::config:update`).

---

## 6 — Operational Polish

* **docker-compose** for Node (TS), Go `SporeDrop`, Redis, Keycloak.
* `/healthz` and `/readyz` endpoints in `server.ts`.
* CI checks (`yarn test`, `go test ./...`).
* Typedoc / Go doc generation under `yarn run docs`.

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