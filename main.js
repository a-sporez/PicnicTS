const { create_context } = require('./core/context');
const { load_plugins } = require('./core/plugin_manager');
const { subscribe } = require('./core/event_bus');

async function main() {
    const context = create_context();
    const plugins = await load_plugins(context);

    // route all events to plugins
    subscribe(event => {
        plugins.forEach(p => {
            if (typeof p.handleEvent === 'function') {
                p.handleEvent(event);
            }
        });
    });

    // simulate event after 1s
    setTimeout(() => {
        context.emit({ type: 'hello', payload: 'world' });
    }, 1000);

    // graceful shutdown
    process.on('SIGINT', async () => {
        for (const p of plugins) {
            if (typeof p.shutdown === 'function') await p.shutdown();
        }
        process.exit(0);
    });
}

main();