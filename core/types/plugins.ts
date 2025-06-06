// /core/types/plugins.ts
// TODO: refactor 7
interface InternalPlugin {
  pluginType?: string; // module, config, bridge, app
  handleEvent?: (event: unknown) => {};
  shutdown?: () => Promise<void>;
}

interface Bridge extends InternalPlugin {
  bridgeName: string;
}

export type { PluginContext } from "../context";
export type { InternalPlugin, Bridge };
