const fs = require('fs');
const path = require('path');

async function load_plugins(context) {
    const pluginPath = path.join(__dirname, '..', 'plugins');
    const folders = fs.readdirSync(pluginPath).filter(f =>
        fs.statSync(path.join(pluginPath, f)).isDirectory()
    );

    const plugins = [];

    for (const folder of folders) {
        const files = fs.readdirSync(path.join(pluginPath, folder)).filter(f => f.endsWith('.js'));
        if (files.length === 0) {
            console.warn(`[plugin_manager] No JS file found in ${folder}`);
            continue;
        }

        const pluginFile = path.join(pluginPath, folder, files[0]);
        const plugin = require(pluginFile);
        if (plugin.init) await plugin.init(context);
        plugins.push(plugin);
    }

    return plugins;
}

module.exports = { load_plugins };