function create_context() {
    return {
        hostId: 'main-node-1',
        logger: console,
        emit: (event) => {
            const {publish} = require('./event_bus');
            publish(event);
        }
    };
}

module.exports = { create_context };