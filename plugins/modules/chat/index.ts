// plugins/chat_modules/index.js
import type { IncomingEvent } from "@/core/types/routes";
import { clientConfig } from "@plugins/configs";

module.exports = {
  name: "chat_module",
  chatLog: [],

  init: async (context: unknown) => {
    module.exports.context = context;
    //@ts-expect-error
    context.logger.log("[chat_module] Initialized.");
  },

  handle_event: async (event: IncomingEvent) => {
    if (!event || event.type !== "chat::message") return;

    const { user, message, clientId } = event.payload;

    const chatEntry = {
      user,
      message,
      timestamp: Date.now(),
      clientId,
    };

    module.exports.chatLog.push(chatEntry);

    console.log(
      `[chat_module] New message from ${user}: ${message}`
    );

    // broadcast chat message event
    module.exports.context.emit({
      type: "chat::message:received",
      payload: chatEntry,
      meta: { plugin: "chat_module" },
    });
  },

  shutdown: async () => {
    console.log("[chat_module] shutting down.");
  },
};
