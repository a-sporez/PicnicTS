// plugins/mistral_bridge/index.js
import fetch from "node-fetch";

import { handle_event } from "../discord";
import type { Bridge } from "@localtypes/plugins";
import type { IncomingEvent } from "@localtypes/routes";

// TODO: turn this and the rest of internal plugins
// into classes extending their respective interfaces
class MistralBridge implements Bridge {
  bridgeName: string;

  constructor() {
    this.bridgeName = "mistral_bridge";
  }
}

// define context
module.exports = {
  name: "mistral_bridge",

  // celled on init, stores context for later
  init: async (context: unknown) => {
    module.exports.context = context;
    (context as any)
      ? (context as any).logger?.log("[mistral_bridge] Initialized.")
      : console.log("failure to init mistral bridge");
  },

  // handles messages coming from Discord vie event bus
  handle_event: async (event: IncomingEvent) => {
    if (event.type !== "discord::message:received") return;

    const botAPI =
      process.env.BOT_API_URL || "http://localhost:8080/chat";
    const { user, message, channelId } = (event as any).payload;

    const allowedChannelId = process.env.DISCORD_CHANNEL_ID;
    if (channelId !== allowedChannelId) return;

    // 👇 Validate input before sending to LLM
    if (
      !message ||
      typeof message !== "string" ||
      message.trim() === ""
    ) {
      console.error(
        "[mistral_bridge] Invalid input message from user:",
        user,
        "→",
        message
      );
      return;
    }

    try {
      const res = await fetch(botAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, message }),
      });

      const { reply } = (await res.json()) as any;

      console.log("[mistral_bridge] LLM raw reply:", reply);
      if (!reply || reply.trim() === "") {
        console.warn(
          "[mistral_bridge] Empty reply from LLM, skipping"
        );
        return;
      }

      console.log("[mistral_bridge] emitting msg to discord:", {
        type: "discord::message:send",
        payload: { content: `🤖 ${reply}`, channelId },
      });

      const safeChunks = [];
      const maxLength = 1900;
      let remaining = reply.trim();

      while (remaining.length > 0) {
        safeChunks.push(remaining.slice(0, maxLength));
        remaining = remaining.slice(maxLength);
      }

      for (const chunk of safeChunks) {
        module.exports.context.emit({
          type: "discord::message:send",
          payload: {
            content: `🤖 ${chunk}`,
            channelId,
          },
          meta: { plugin: "mistral_bridge" },
        });
      }
    } catch (err) {
      (module.exports.context as any)?.logger?.error(
        "[mistral_bridge] error:",
        err
      );
    }
  },

  shutdown: async () => {
    console.log("[mistral_bridge] shutdown");
  },
};
