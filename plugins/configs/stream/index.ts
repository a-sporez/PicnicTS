// plugins/stream_config/index.js
let streamConfig = {
    title: "Untitled Stream",
    isLive: false,
    tags: []
};

module.exports = {
    name: "stream_config",

    init: async (context) => {
        context.logger.log('[stream_config] Initialized.');
        context.logger.log('[stream_config] Curent Config:', streamConfig);
    },

    handle_event: (event) => {
        if (event.type === 'stream::config:update') {
            const newConfig = event.payload;
            // appending containers
            streamConfig = { ...streamConfig, ...newConfig };

            console.log('[stream_config] Config updated:', streamConfig);
        }

        if (event.type === 'stream::config:get') {
            console.log('[stream_config] Sending current config:', streamConfig);
        }
    },

    shutdown: async () => {
        console.log('[stream_config] Shutting down.')
    }
};