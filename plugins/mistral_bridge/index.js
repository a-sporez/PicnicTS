// plugins/mistral_bridge/index.js
const fetch = require('node-fetch');
const { handle_event } = require('../discord_bridge');

module.exports = {
    name: 'mistral_bridge',

    // celled on init, stores context for later
    init: async (context) => {
        module.exports.context = context;
        context.logger.log('[mistral_bridge] Initialized.');
    },

    // handles messages coming from Discord vie event bus
    handle_event: async (event) => {
        if (event.type !== 'discord::message:received') return;

        const botAPI = process.env.BOT_API_URL || 'http://localhost:8080/chat';
        const {user, message, channelId} = event.payload;

        try {
            // forward message to the chatbot's backend
            const res = await fetch(botAPI, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user, message})
            });

            const {reply} = await res.json();

            // exit a message back to discord if the bot responded
            if (reply) {
                module.exports.context.emit({
                    type:'discord::message:send',
                    payload: {
                        message:`🤖 ${reply}`,
                        channelId
                    },
                    meta: {plugin: 'mistral_bridge'}
                });
            }
        } catch (err) {
            module.exports.context.logger.error('[mistral_bridge] error:', err);
        }
    },
    shutdown: async () => {
        console.log('[mistral_bridge] shutdown');
    }
};