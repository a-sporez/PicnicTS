import fs from "fs";
import path from "path";

import type { InternalPlugin } from "./types/plugins";

async function loadPlugins(
  context: unknown
): Promise<InternalPlugin[]> {
  const plugins = [];
  const pluginTypes = ["apps", "bridges", "configs", "modules"];
  for (const pt of pluginTypes) {
    const pluginPath = path.join(__dirname, "..", "plugins", pt);
    const folders = fs
      .readdirSync(pluginPath)
      .filter((f: string) =>
        fs.statSync(path.join(pluginPath, f)).isDirectory()
      );
    for (const folder of folders) {
      const plugin = require(path.join(pluginPath, folder));
      if (plugin.init) await plugin.init(context);
      plugins.push(plugin);
    }
  }

  return plugins;
}

export { loadPlugins };
