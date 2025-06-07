// /core/EventBus.ts
// WIP: strongly typed implementation
const subscribers: Record<string, Array<(event: unknown) =>
  void | Promise<void>>> = {};

function listen(eventType: string, handler: (event: unknown) => void) {
  if (!subscribers[eventType]) subscribers[eventType] = [];
  subscribers[eventType].push(handler);
}

async function emit(eventType: string, event: unknown) {
  const handlers = subscribers[eventType] || [];
  for (const func of handlers) {
    await func(event);
  }
}

export {listen, emit};