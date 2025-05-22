const subscribers = [];

function subscribe (fn) {
    subscribers.push(fn);
}

function publish (event) {
    for (const fn of subscribers) {
        fn(event);
    }
}

module.exports = { subscribe, publish };