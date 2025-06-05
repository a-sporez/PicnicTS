const subscribers: Array<Function> = [];

function subscribe(fn: Function) {
  subscribers.push(fn);
}

function publishEvent(event: unknown) {
  for (const fn of subscribers) {
    fn(event);
  }
}

export { subscribe, publishEvent };
