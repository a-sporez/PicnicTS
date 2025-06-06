// /core/types/context.ts
interface LoggerContext {
  severity: "log" | "warn" | "error";
  scope: "global" | "local";
  plugin?: string;
  location?: string;
}

interface PluginContext {
  hostId: string;
  logger: Console;
  emit: (content: unknown) => void;
}

export type { LoggerContext, PluginContext };
