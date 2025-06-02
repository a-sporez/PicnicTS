// main.js **ENTRY POINT**
require('dotenv').config({ path: __dirname + '/.env' });
console.log('[DEBUG] TOKEN:', process.env.DISCORD_TOKEN);
console.log('[DEBUG] CHANNEL:', process.env.DISCORD_CHANNEL_ID);
const {create_context} = require('./core/context');
const {load_plugins} = require('./core/plugin_manager');
const {subscribe} = require('./core/event_bus');

const context = create_context();

async function main() {
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
        context.emit({type: 'typeOK', payload: 'payloadOK'});
    }, 1000);

    // simulate stream config update
    setTimeout(() => {
        context.emit({
            type: 'stream::config:update',
            payload: {
                title: 'Test Stream Config Update',
                tags: ['tag1', 'tag2']
            }
        });
    }, 1200);

    // simulate stream config switch
    setTimeout(() => {
        context.emit({
            type: 'stream::config:get'
        });
    }, 1400);

    // simulate client config update
    setTimeout(() => {
        context.emit({
            type: 'client::config:update',
            payload: {
                clientId: 'Client Config OK',
                config: {
                    theme: 'Test Config',
                    emotesEnabled: true
                }
            }
        });
    }, 1600);

    // simulate client config switch
    setTimeout(() => {
        context.emit({
            type: 'client::config:get',
            payload: {clientId: 'Client Config Switch OK'}
        });
    }, 1800);

    // simulate chat message
    setTimeout(() => {
        context.emit({
            type: 'chat::message',
            payload: {
                clientId: 'Client Chat OK',
                user: 'abyss',
                message: 'Chat Messages OK! :fire: :smile: :thumbsup:'
            }
        });
    }, 2000);

    // graceful shutdown
    process.on('SIGINT', async () => {
        for (const p of plugins) {
            if (typeof p.shutdown === 'function') await p.shutdown();
        }
        process.exit(0);
    });
}

main();
module.exports = context;