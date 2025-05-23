// plugins/emote_module/index.js

const EMOTE_MAPS = {
    ':smile:': '😄',
    ':fire:': '🔥',
    ':thumbsup:': '👍'
};

module.exports = {
    name: 'emote_module',
    
    init: async (context) => {
        module.exports.context = context;
        context.logger.log('[emote_module] Initialized.');
    },

    handle_event: async (event) => {
        if (event.type !== 'chat::message:received') return;

        const msg = event.payload.message;
        const transformed = msg.replace(/:\w+:/g, (match) => EMOTE_MAPS[match] || match);

        if (transformed !== msg) {
            console.log(`[emote_module] Emotes applied: "${msg}" → "${transformed}"`);

            // optionally rebroadcast the transformed message
            module.exports.context.emit({
                type: 'chat::message:emoted',
                payload: {
                    ...event.payload,
                    message: transformed
                },
                meta: { plugin: 'emote_module' }
            });
        }
    },

    shutdown: async () => {
        console.log('[emote_module] shutting down.');
    }
};