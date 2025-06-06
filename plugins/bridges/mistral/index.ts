// plugins/bridges/mistral/index.js
// WIP: refactor 0
import fetch from "node-fetch";

import type { PluginContext } from "@localtypes/plugins";
import type { Bridge } from "@localtypes/plugins";
import type { IncomingEvent } from "@localtypes/routes";

// WIP: turn this and the rest of internal plugins
// into classes extending their respective interfaces
class MistralBridge implements Bridge {
  bridgeName = "mistral_bridge";
  ctx: PluginContext | undefined;

  // called on init, stores context for later
  init(ctx: PluginContext) {
    this.ctx = ctx;
    ctx.logger.info(`[${this.bridgeName}] initialized`);
    ctx.bus.on(
      "discord::message:received",
      this.handleEvent.bind(this)
    );
  }
  async shutdown(): Promise<void> {
    //this.ctx?.logger?.info?.("[mistral_bridge] shutdown");
    console.log(`[${this.bridgeName}] shutdown`);
  }
  // handles messages coming from Discord vie event bus
  async handleEvent(event: IncomingEvent) {
    if (!this.ctx) return;

    {
      if (event.type !== "discord::message:received") return;

      const botAPI =
        process.env.BOT_API_URL || "http://localhost:8080/chat";
      const { user, message, channelId } = (event as any).payload;

      const allowedChannelId = process.env.DISCORD_CHANNEL_ID;
      if (channelId !== allowedChannelId) return;

      // Validate input before sending to LLM
      if (
        !message ||
        typeof message !== "string" ||
        message.trim() === ""
      ) {
        this.ctx.logger.error(
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

        this.ctx.logger.info(
          "[mistral_bridge] LLM raw reply:",
          reply
        );
        if (!reply || reply.trim() === "") {
          this.ctx.logger.warn(
            "[mistral_bridge] Empty reply from LLM, skipping"
          );
          return;
        }

        this.ctx.logger.info(
          "[mistral_bridge] emitting msg to discord:",
          {
            type: "discord::message:send",
            payload: { content: `🤖 ${reply}`, channelId },
          }
        );

        const safeChunks: string[] = [];
        const maxLength = 1900;
        let remaining = reply.trim();

        while (remaining.length > 0) {
          safeChunks.push(remaining.slice(0, maxLength));
          remaining = remaining.slice(maxLength);
        }

        for (const chunk of safeChunks) {
          this.ctx.emit({
            type: "discord::message:send",
            payload: {
              content: `🤖 ${chunk}`,
              channelId,
            },
            meta: { plugin: "mistral_bridge" },
          });
        }
      } catch (err) {
        this.ctx.logger.error("[mistral_bridge] error:", err);
      }
    }
  }
}

export default MistralBridge;
