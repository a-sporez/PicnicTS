## Core Systems

### `core/context.js`

| Name                  | Type       | Description                                           |
| --------------------- | ---------- | ----------------------------------------------------- |
| `create_context()`    | `Function` | Creates a shared context object passed to all plugins |
| `context.emit(event)` | `Function` | Emits an event to the internal event bus              |
| `context.logger`      | `Object`   | Logger (uses `console` for now)                       |
| `context.hostId`      | `String`   | Identifier for this host instance                     |

---

### `core/event_bus.js`

| Name             | Type              | Description                                    |
| ---------------- | ----------------- | ---------------------------------------------- |
| `subscribe(fn)`  | `Function`        | Adds a subscriber (callback) to receive events |
| `publish(event)` | `Function`        | Broadcasts an event to all subscribers         |
| `subscribers`    | `Array<Function>` | Internal list of event listeners               |

---

### `core/plugin_manager.js`

| Name                    | Type       | Description                                                       |
| ----------------------- | ---------- | ----------------------------------------------------------------- |
| `load_plugins(context)` | `Function` | Loads all plugins from `plugins/` directory, calls their `init()` |

---

## Entrypoint

### `main.js`

| Name                | Type            | Description                                            |
| ------------------- | --------------- | ------------------------------------------------------ |
| `main()`            | `Function`      | Loads context, loads plugins, subscribes to all events |
| `context.emit(...)` | `Function`      | Emits events manually (simulated test cases)           |
| `plugins`           | `Array<Plugin>` | List of loaded plugin modules                          |

---

## Express API

### `server.js`

| Name                    | Type    | Description                                                     |
| ----------------------- | ------- | --------------------------------------------------------------- |
| `POST /events/incoming` | `Route` | Accepts an event `{ type, payload }` and injects into event bus |

---

## Plugins

### `chat_module/index.js`

| Name                                               | Type       | Description                                           |
| -------------------------------------------------- | ---------- | ----------------------------------------------------- |
| `chatLog`                                          | `Array`    | Stores all received chat messages                     |
| `context.emit({ type: 'chat::message:received' })` | `Function` | Broadcasts a processed message                        |
| `handle_event()`                                   | `Function` | Receives `chat::message`, pushes to log, rebroadcasts |

---

### `emote_module/index.js`

| Name                                             | Type       | Description                                                        |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------ |
| `EMOTE_MAPS`                                     | `Object`   | Dictionary mapping emote text to emoji                             |
| `handle_event()`                                 | `Function` | Receives `chat::message:received`, transforms emotes, rebroadcasts |
| `context.emit({ type: 'chat::message:emoted' })` | `Function` | Broadcasts transformed message                                     |

---

### `stream_config/index.js`

| Name                      | Type       | Description                                           |
| ------------------------- | ---------- | ----------------------------------------------------- |
| `streamConfig`            | `Object`   | Holds stream metadata (`title`, `tags`)               |
| `handle_event()`          | `Function` | Handles `stream::config:update`, `stream::config:get` |
| `context.logger.log(...)` | `Function` | Outputs stream config status                          |

---

### `client_config/index.js`

| Name                         | Type       | Description                                 |
| ---------------------------- | ---------- | ------------------------------------------- |
| `configs`                    | `Map`      | In-memory map of `clientId` → config object |
| `contextReference`           | `Object`   | Stores context for use in `handle_event`    |
| `handle_event()`             | `Function` | Handles client config updates and lookups   |
| `contextReference.emit(...)` | `Function` | Broadcasts `client::config:changed`         |

---

### `greeter/index.js`

| Name             | Type       | Description                                   |
| ---------------- | ---------- | --------------------------------------------- |
| `handle_event()` | `Function` | Responds to `hello` events for debug purposes |

---

### `discord_bridge/index.js`

| Name                  | Type       | Description                                                |
| --------------------- | ---------- | ---------------------------------------------------------- |
| `init(context)`       | `Function` | Initializes Discord bot and subscribes to message events   |
| `handle_event(event)` | `Function` | Sends messages to Discord on `discord::message:send` event |
| `context.emit(...)`   | `Function` | Emits `discord::message:received` to internal system       |
| `bot`                 | `Client`   | Instance of Discord.js bot                                 |

---

### `mistral_bridge/index.js`

| Name                      | Type       | Description                                                       |
| ------------------------- | ---------- | ----------------------------------------------------------------- |
| `init(context)`           | `Function` | Initializes context and sets up chatbot proxy                     |
| `handle_event(event)`     | `Function` | Receives `discord::message:received` and sends to Mistral backend |
| `context.emit(...)`       | `Function` | Emits `discord::message:send` with reply from Mistral             |
| `process.env.BOT_API_URL` | `String`   | API URL for chatbot service                                       |

---

### Example: Event Object

```js
{
  type: 'chat::message',
  payload: {
    clientId: 'abc123',
    user: 'alice',
    message: ':fire: hello'
  },
  meta: {
    plugin: 'chat_module'
  }
}
```
