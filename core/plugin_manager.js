const fs = require('fs');
const path = require('path');

async function load_plugins(context) {
    const pluginPath = path.join(__dirname, '..', 'plugins');
    const folders = fs.readdirSync(pluginPath).filter(f =>
        fs.statSync(path.join(pluginPath, f)).isDirectory()
    );

    const plugins = [];

    for (const folder of folders) {
        const plugin = require(path.join(pluginPath, folder));
        if (plugin.init) await plugin.init(context);
        plugins.push(plugin);
    }
    return plugins;
}

module.exports = { load_plugins };