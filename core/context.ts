// /core/context.ts
// WIP: refactor 0
// TODO: review 5
import { publishEvent } from "./EventBus";
import type { LoggerContext } from "./types/context";

class ContextProvider {
  hostId: string;
  localeOptions: {
    weekday?: "long" | "short" | "narrow";
    year?: "numeric" | "2-digit";
    month?: "short" | "long" | "numeric";
    day?: "numeric" | "2-digit";
  };

  // TODO: get context
  globalContext?: {};

  constructor() {
    this.hostId = "main-node-1";
    this.localeOptions = {
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
  }

  logger(msg: string, ctx: LoggerContext): void {
    const date = new Date();
    const datenow = `${date.toLocaleString("uk-UA", this.localeOptions)}`;

    console[ctx.severity](`[${datenow}]@${ctx.scope}: ${msg}`);
  }

  emitter(content: string) {
    publishEvent(content);
    this.logger("event emitted", {
      severity: "log",
      scope: "global",
    });
  }

  // TODO: get context
  getter() {
    return this.globalContext;
  }

  // TODO: set context
  setter(): void {}
}

export interface PluginContext {
  hostId: string;
  logger: Console;
  emit: (content: unknown) => void;
}

function createContext(): PluginContext {
  return {
    hostId: "main-node-1",
    logger: console,
    emit: (content: string) => {
      publishEvent(content);
    },
  };
}

export { createContext, ContextProvider };
