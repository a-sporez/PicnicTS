// /core/types/context.ts
interface LoggerContext {
  severity: "log" | "warn" | "error";
  scope: "global" | "local";
  plugin?: string;
  location?: string;
}

export type { LoggerContext };
