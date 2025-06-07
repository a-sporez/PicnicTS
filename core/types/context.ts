// /core/types/context.ts

interface EventBus {
  listen(eventType: string, handler: (event: unknown) =>
    void | Promise<void>): void;
  emit(eventType: string, event: unknown): void;
}

interface LoggerContext {
  severity: "log" | "warn" | "error";
  scope: "global" | "local";
  plugin?: string;
  location?: string;
}

interface PluginContext {
  hostId: string;
  logger: Console;
  bus: EventBus;
  emit: (content: unknown) => void;
}

export type { LoggerContext, PluginContext };
