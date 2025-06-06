// /core/context.ts
// WIP: refactor 0
// TODO: review 5
import { publishEvent } from "./EventBus";

export interface PluginContext {
  hostId: string;
  logger: Console;
  emit: (content: unknown) => void;
}

function createContext(): PluginContext {
  return {
    hostId: "main-node-1",
    logger: console,
    emit: (content: unknown) => {
      publishEvent(content);
    },
  };
}

export { createContext };
