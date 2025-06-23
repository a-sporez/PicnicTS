// plugins/modules/chat/index.js
// WIP+: ESM convert
import { clientConfig } from "@plugins/configs";
import type {IncomingEvent, ChatLogEntry} from "@/core/types/routes";
import type {PluginContext} from "@/core/types/context";
import type {Module} from '@localtypes/plugins';

class ChatModule implements Module {
  pluginType = 'module';
  moduleName = 'chat';
  private contextRef: PluginContext | null = null;
  private chatLog: ChatLogEntry[] = [];

  constructor() {}
  // called by plugin manager on startup
  async init (context: PluginContext) {
    this.contextRef = context;

    context.logger.log("[ChatModule] Initialized.");
  }

  async handleEvent (event: IncomingEvent) {
    if (!event || event.type !== "chat::message") return;

    const { user, message, clientId } = (event as any).payload;

    const chatEntry: ChatLogEntry = {
      user,
      message,
      timestamp: Date.now(),
      clientId,
    };

    this.chatLog.push(chatEntry);

    this.contextRef?.logger.log(
      `[ChatModule] New message from ${user}: ${message}`
    );

    // broadcast chat message event
    this.contextRef?.emit({
      type: "chat::message:received",
      payload: chatEntry,
      meta: { plugin: "module.chat" },
    });
  }

  async shutdown () {
    this.contextRef?.logger.log("[ChatModule] shutting down.");
  }

  getChatLog(): ChatLogEntry[] {
    return [...this.chatLog];
  }
}

export default ChatModule;