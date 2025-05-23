// main.js **ENTRY POINT**
const { create_context } = require('./core/context');
const { load_plugins } = require('./core/plugin_manager');
const { subscribe } = require('./core/event_bus');

async function main() {
    const context = create_context();
    const plugins = await load_plugins(context);

    // route all events to plugins
    subscribe(event => {
        plugins.forEach(p => {
            if (typeof p.handle_event === 'function') {
                p.handle_event(event);
            }
        });
    });

    // simulate event after 1s
    setTimeout(() => {
        context.emit({ type: 'hello', payload: 'world' });
    }, 1000);

    // simulate stream config update
    setTimeout(() => {
        context.emit({
            type: 'stream::config:update',
            payload: {
                title: 'Test Stream Config Update',
                tags: ['tags1', 'tags2']
            }
        });
    }, 2000);

    // simulate stream config switch
    setTimeout(() => {
        context.emit({
            type: 'stream::config:get'
        });
    }, 3000);

    // simulate client config update
    setTimeout(() => {
        context.emit({
            type: 'client::config:update',
            payload: {
                clientId: 'client A',
                config: {
                    theme: 'theme A',
                    emotesEnabled: true
                }
            }
        });
    }, 4000);

    // simulate client config switch
    setTimeout(() => {
        context.emit({
            type: 'client::config:get',
            payload: { clientId: 'client A' }
        });
    }, 5000);

    // simulate chat message
    setTimeout(() => {
        context.emit({
            type: 'chat::message',
            payload: {
                clientId: 'client A',
                user: 'alice',
                message: 'This is fucking lit! :fire: :smile: :thumbsup:'
            }
        });
    }, 6000);

    // graceful shutdown
    process.on('SIGINT', async () => {
        for (const p of plugins) {
            if (typeof p.shutdown === 'function') await p.shutdown();
        }
        process.exit(0);
    });
}

main();