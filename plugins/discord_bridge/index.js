// plugins/discord_bridge/index.js
const {Client, GatewayIntentBits} = require('discord.js');

let bot = null;
let contextRef = null;

module.exports = {
    name: 'discord_bridge',

    // called by plugin manager on startup
    init: async (context) => {
        contextRef = context;

        // load environment variables
        const token = process.env.DISCORD_TOKEN;
        const channelId = process.env.DISCORD_CHANNEL_ID;

        if (!token || !channelId) {
            throw new Error('[discord_bridge] missing .env variables');
        }

        // Initialize the discord client
        bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        // log when the bot is ready
        bot.on('ready', () => {
            context.logger.log(`[discord_bridge] Connected as ${bot.user.tag}`);
        });

        // listen to messages in channel
        bot.on('messageCreate', (msg) => {
            if (msg.author.bot) return; // ignore bot messages

            // Emit a structured event into your system.
            context.emit({
                type: 'discord::message:received',
                payload: {
                    user: msg.author.username,
                    message: msg.content,
                    channelId: msg.channel.id,
                    messageId: msg.id
                },
                meta: {plugin: 'discord_bridge'}
            });
        });

        context.logger.log('[discord_bridge] Logging in...');
        await bot.login(token);
    },

    // listens for internal events like 'discord::message:send'
    handle_event: async (event) => {
        if (event.type !== 'discord::message:send') return;

        const {content, channelId} = event.payload;

        // use the provided channel or fallback to default from .env
        const id = channelId || process.env.DISCORD_CHANNEL_ID;
        const channel = await bot.channels.fetch(id).catch(err => {
            console.warn('[discord_bridge] channel fetch failed', err);
            return null;
        });

        if (!channel) {
            console.warn('[discord_bridge] cannot find channel for ID:', id);
            return;
        }

        if (channel && channel.send) {
            if (!content || typeof content !== 'string' || content.trim() === "") {
                contextRef.logger.warn('[discord_bridge] Invalid content payload:', content);
                return;
            }
            await channel.send({content});
        }
    },

    shutdown: async () => {
        if (bot) await bot.destroy();
        contextRef.logger.log('[discord_bridge] shutdown')
    }
};