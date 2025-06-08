# PicnicTS – TypeScript Streamer Plugin System

Node.js + TypeScript plugin-hosting backend with Go chatbot microservice (SporeDrop).

This system uses a modular, type-safe, event-based architecture to bridge Discord, LLM APIs, and internal plugin logic. Plugin communication occurs through a central event bus and strongly typed interfaces. External HTTP injection is supported via Express.

---

## Directory Map

```
/                (project root)
│  package.json
│  package-lock.json
│  tsconfig.json
│  biome.json
│  server.config.json
│  server.ts            ← HTTP entry-point (not shown)
│  main.ts              ← in-process dev runner
│
├─core
│  │  context.ts        ← creates the “emit/ logger” ctx
│  │  EventBus.ts       ← simple pub/sub bus
│  │  PluginManager.ts  ← dynamic loader
│  └─types
│       plugins.ts      ← InternalPlugin, Bridge types
│       routes.ts       ← IncomingEvent shape
│
├─plugins
│  ├─modules
│  │   │ index.ts       ← re-exports chat & emote
│  │   ├─chat
│  │   │   index.ts     ← logs & rebroadcasts chat
│  │   └─emote
│  │       index.ts     ← emoji substitution pass-through
│  ├─configs
│  │   │ index.ts       ← re-exports client & stream
│  │   ├─client
│  │   │   index.ts     ← per-client config store
│  │   └─stream
│  │       index.ts     ← stream metadata store
│  ├─bridges
│  │   │ index.ts       ← re-exports discord & mistral
│  │   ├─discord
│  │   │   index.js     ← Discord bot ↔ EventBus
│  │   └─mistral
│  │       index.ts     ← LLM call / chunking logic
│  └─apps
│      │ index.ts       ← re-exports greeter
│      └─greeter
│          index.ts     ← “hello” demo plugin
│
└─SporeDrop            (Go micro-service)
    main.go            ← Mistral proxy + memory store
    go.mod / go.sum
```

---

## Plugin Interface (TypeScript)

All plugins must conform to this interface:

```ts
export interface Plugin {
  pluginType?: string;
  init(context: PluginContext): Promise<void>;
  handleEvent(event: { type: string; [key: string]: unknown }): Promise<void> | void;
  shutdown(): Promise<void>;
}
```

* `pluginType` is optional but recommended (`"bridge"`, `"module"`, etc).
* Method names are now `init`, `handleEvent`, `shutdown`.

Plugins are loaded dynamically and passed the shared `context` on startup.
They handle events via `handleEvent` and may clean up using `shutdown()`.

---

## Core Modules

### `core/context.ts`

| Name              | Type       | Description                                    |
| ----------------- | ---------- | ---------------------------------------------- |
| `createContext()` | `Function` | Returns a shared context object for plugins    |
| `context.emit()`  | `Function` | Emits event objects to the EventBus            |
| `context.logger`  | `Logger`   | Provided logger (e.g., console or Pino)        |
| `context.hostId`  | `string`   | ID string identifying the module host instance |
| `context.bus`     | `EventBus` | The shared event bus with Listen/Publish       |

---

### `core/EventBus.ts`

| Name      | Type                                                                              | Description                                   |
| --------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| `Listen`  | `(eventType: string, handler: (event: unknown) => void \| Promise<void>) => void` | Register a listener for a specific event type |
| `Publish` | `(eventType: string, event: unknown) => Promise<void>`                            | Emit an event to all listeners for this type  |
| `Event`   | `{ type: string; payload: object; meta?: object }`                                | Standardized system event object              |

---

### `core/PluginManager.ts`

| Name            | Type       | Description                                       |
| --------------- | ---------- | ------------------------------------------------- |
| `loadPlugins()` | `Function` | Loads all plugins from `/plugins`, calls `init()` |
|                 |            | Uses `import()` dynamically with `default` export |

---

## Express API (`server.ts`)

| Route              | Method | Description                                                 |
| ------------------ | ------ | ----------------------------------------------------------- |
| `/events/incoming` | POST   | Accepts `{ type, payload }` and routes to internal EventBus |

---

## Plugin Summary Table

| Plugin           | Handles Events                                | Emits Events                        | Notes                        |
| ---------------- | --------------------------------------------- | ----------------------------------- | ---------------------------- |
| `chat_module`    | `chat::message`                               | `chat::message:received`            | Stores and rebroadcasts chat |
| `emote_module`   | `chat::message:received`                      | `chat::message:emoted`              | Transforms emojis            |
| `stream_config`  | `stream::config:update`, `stream::config:get` | –                                   | Logs stream metadata         |
| `client_config`  | `client::config:update`, `client::config:get` | `client::config:changed`            | Tracks clientId configs      |
| `discord_bridge` | `discord::message:send`                       | `discord::message:received`         | Discord.js message bridge    |
| `mistral_bridge` | `discord::message:received`                   | `discord::message:send` (LLM reply) | Forwards to Go API           |
| `greeter`        | `hello`                                       | –                                   | Simple debugging plugin      |

---

## **Example EventBus Usage (Updated)**

```ts
// Register an event handler for a specific event type
context.bus.Listen("discord::message:send", (event) => { ... });

// Publish an event to all listeners
context.bus.Publish("discord::message:send", {
  type: "discord::message:send",
  payload: { ... },
  meta: { plugin: "my_plugin" }
});
```

---

## **Event Object Standard**

All events passed through the bus must have:

```ts
{
  type: string; // The event type (e.g. "discord::message:send")
  payload: object; // Event-specific data
  meta?: object;   // Optional metadata
}
```

---

## See Also

* [SporeDrop](documentation/SporeDrop.md) – Go chatbot backend
* [roadmap_v1](documentation/roadmap_v1.md) – Project plan and upgrade path

## Component Design Blueprint

                        +---------------------------+
                        |      Frontend App (UI)    |
                        |     (Astro / WebSocket)   |
                        +------------+--------------+
                                     |
                         Token Auth + WebSocket
                                     ↓
                +------------------ API Gateway ------------------+
                |     Express (server.ts) + middleware            |
                |     - Rate limits                                 |
                |     - JWT auth (Keycloak planned)                |
                +------------------+-------------------------------+
                                   ↓
                      +------------↓------------+
                      |     Plugin Host (TS)    |
                      |        main.ts          |
                      +----+----------+---------+
                           |          |
                +----------+   +------+-------+--------+
                | EventBus.ts | PluginManager.ts       |
                +-------------+------------------------+
                           |           |           |
                           ↓           ↓           ↓
                     +-----+-----+ +---+----+ +-----+------+
                     | streamCfg | | client | | chatModule |
                     |  plugin   | | plugin | | plugin     |
                     +-----+-----+ +--------+ +------------+
                           |           |           |
                           ↓           ↓           ↓
                 Redis (future)   Redis (future)   In-memory

          ⬑ All plugins communicate via shared event bus

                           +--------------------+
                           |   Keycloak Server  |
                           | (OAuth2, RBAC)     |
                           +--------------------+

                           +--------------------+
                           |     SporeDrop      |
                           |  Go chatbot API    |
                           +--------------------+
