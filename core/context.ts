// /core/context.ts
// WIP: refactor 0
// TODO: review 5
import {Listen, Publish} from "./EventBus";
import type {
  LoggerContext,
  PluginContext,
} from "./types/context";

type GlobalContext = Record<string, unknown>

class ContextProvider {
  hostId: string;
  localeOptions: {
    weekday?: "long" | "short" | "narrow";
    year?: "numeric" | "2-digit";
    month?: "short" | "long" | "numeric";
    day?: "numeric" | "2-digit";
  };

  // store global context
  private _globalContext: GlobalContext = {};

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

  emitter(eventType: string, event: unknown) {
    Publish(eventType, event);
    this.logger(`event "${eventType}" emitted`, {
      severity: 'log',
      scope: 'global',
    });
  }

  // get global context property
  get globalContext(): GlobalContext {
    return this._globalContext;
  }

  // set global context properties, add validation or hooks here.
  set globalContext(ctx: GlobalContext) {
    this._globalContext = ctx;
    this.logger("global context update", {
      severity: 'log',
      scope: 'global'
    });
  }
}

// factory pattern creates PluginContext object.
// `emit` func expects event with a "type" field.
function createContext(): PluginContext {
  return {
    hostId: "main-node-1",
    logger: console,
    emit: (event) => {
      Publish(event.type, event);
    },
    bus: {Listen, Publish},
  };
}

export {createContext, ContextProvider};
