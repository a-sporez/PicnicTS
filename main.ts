// main.js **APP ENTRY POINT**
//
import { createContext } from "./core/context";
import { loadPlugins } from "./core/PluginManager";
import { subscribe } from "./core/EventBus";

console.log("[DEBUG] TOKEN:", process.env.DISCORD_TOKEN);
console.log("[DEBUG] SERVER:", process.env.PRIMARY_GUILD_ID);
console.log("[DEBUG] CHANNEL:", process.env.DISCORD_CHANNEL_ID);

const context = createContext();

async function main() {
  const plugins = await loadPlugins(context);

  // route all events to plugins
  subscribe((event: string) => {
    for (const p of plugins) {
      if (typeof p.handleEvent === "function") {
        p.handleEvent(event);
      }
    }
  });

  // simulate event after 1s
  setTimeout(() => {
    context.emit({ type: "typeOK", payload: "payloadOK" });
  }, 1000);

  // simulate stream config update
  setTimeout(() => {
    context.emit({
      type: "stream::config:update",
      payload: {
        title: "Test Stream Config Update",
        tags: ["tag1", "tag2"],
      },
    });
  }, 1200);

  // simulate stream config switch
  setTimeout(() => {
    context.emit({
      type: "stream::config:get",
    });
  }, 1400);

  // simulate client config update
  setTimeout(() => {
    context.emit({
      type: "client::config:update",
      payload: {
        clientId: "Client Config OK",
        config: {
          theme: "Test Config",
          emotesEnabled: true,
        },
      },
    });
  }, 1600);

  // simulate client config switch
  setTimeout(() => {
    context.emit({
      type: "client::config:get",
      payload: { clientId: "Client Config Switch OK" },
    });
  }, 1800);

  // simulate chat message
  setTimeout(() => {
    context.emit({
      type: "chat::message",
      payload: {
        clientId: "Client Chat OK",
        user: "abyss",
        message: "Chat Messages OK! :fire: :smile: :thumbsup:",
      },
    });
  }, 2000);

  // graceful shutdown
  process.on("SIGINT", async () => {
    for (const p of plugins) {
      if (p.shutdown) await p.shutdown();
    }
    process.exit(0);
  });
}

main();
module.exports = context;
