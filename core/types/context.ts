// /core/types/context.ts

interface EventBus {
  Listen(eventType: string, handler: (event: unknown) =>
    void | Promise<void>): void;
  Publish(eventType: string, event: unknown): void;
}

interface LoggerContext {
  severity: "log" | "warn" | "error";
  scope: "global" | "local";
  plugin?: string;
  location?: string;
}

interface PluginContext {
  hostId: string;
  logger: typeof console;
  emit: (event: {type: string; [key: string]: unknown}) => void;
  bus: EventBus;
}

export type { LoggerContext, PluginContext };
