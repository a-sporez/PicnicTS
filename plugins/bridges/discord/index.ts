// plugins/bridge/discord/index.js
// WIP+: ESM convert
import {Client, GatewayIntentBits} from 'discord.js';
import type {PluginContext} from '@localtypes/context';
import type {Bridge} from '@localtypes/plugins'

let bot = null;
let contextRef = null;

class DiscordBridge implements Bridge {
    pluginName = 'bridge';
    bridgeName = 'discord';
    private bot: Client | null = null;
    private contextRef: PluginContext | null = null;

    constructor() {}

    // called by plugin manager on startup
    async init (context: PluginContext) {
        this.contextRef = context;
        // load environment variables
        const token = process.env.DISCORD_TOKEN;
        const channelId = process.env.DISCORD_CHANNEL_ID;

        if (!token || !channelId) {
            throw new Error('[discord_bridge] missing .env variables');
        }

        // Initialize the discord client
        this.bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
        });

        // log when the bot is ready
        this.bot.on('ready', () => {
            context.logger.log(
                `[discord_bridge] Connected as ${this.bot?.user?.tag}`
            );
        });

        // listen to messages in channel
        this.bot.on('messageCreate', (msg) => {
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
        await this.bot.login(token);
    },

    // listens for internal events like 'discord::message:send'
    handlEvent (event: any) {
        if (event.type !== 'discord::message:send') return;

        const {content, channelId} = event.payload;
        // use the provided channel or fallback to default from .env
        const id = channelId || process.env.DISCORD_CHANNEL_ID;

        if (!this.bot) return;
        const channel = await this.bot.channels.fetch(id).catch(err => {
            console.warn('[discord_bridge] channel fetch failed', err);
            return null;
        });

        if (!channel || typeof (channel as any).send !== 'function') {
            console.warn('[discord_bridge] cannot find channel for ID:', id);
            return;
        }

        if (!content || typeof content !== 'string' || content.trim() === "") {
            contextRef.logger.warn('[discord_bridge] Invalid content payload:', content);
            return;
        }
        await channel.send({content});
    }

    async shutdown () {
        if (this.bot) await this.bot.destroy();
        this.contextRef?.logger.log('[discord_bridge] shutdown');
    }
}

export default DiscordBridge;