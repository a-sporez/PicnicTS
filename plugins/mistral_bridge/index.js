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

        const allowedChannelId = process.env.DISCORD_CHANNEL_ID;
        if (channelId !== allowedChannelId) return;

        // 👇 Validate input before sending to LLM
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.error('[mistral_bridge] Invalid input message from user:', user, '→', message);
            return;
        }

        try {
            const res = await fetch(botAPI, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user, message})
            });

            const {reply} = await res.json();

            console.log('[mistral_bridge] LLM raw reply:', reply);
            if (!reply || reply.trim() === "") {
                console.warn('[mistral_bridge] Empty reply from LLM, skipping');
                return;
            }

            console.log('[mistral_bridge] emitting msg to discord:', {
                type: 'discord::message:send',
                payload: {content: `🤖 ${reply}`, channelId}
            });

            const safeChunks = [];
            const maxLength  = 1900;
            let remaining    = reply.trim();

            while (remaining.length > 0) {
                safeChunks.push(remaining.slice(0, maxLength));
                remaining = remaining.slice(maxLength);
            }

            for (const chunk of safeChunks) {
                module.exports.context.emit({
                    type:'discord::message:send',
                    payload: {
                        content: `🤖 ${chunk}`,
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