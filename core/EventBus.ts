// /core/EventBus.ts
const subscribers: Record<string, Array<(event: unknown) =>
  void | Promise<void>>> = {};

function Listen(
  eventType: string, handler: (event: unknown) => void | Promise <void>) {
  if (!subscribers[eventType]) subscribers[eventType] = [];
  subscribers[eventType].push(handler);
}

async function Publish(eventType: string, event: unknown) {
  const handlers = subscribers[eventType] || [];
  for (const func of handlers) {
    await func(event);
  }
}

export {Listen, Publish};