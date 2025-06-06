// /core/context.ts
// TODO: refactor 5
import { publishEvent } from "./EventBus";

function createContext() {
  return {
    hostId: "main-node-1",
    logger: console,
    emit: (content: unknown) => {
      publishEvent(content);
    },
  };
}

export { createContext };
