// /core/types/plugins.ts
// TODO: refactor 7
interface InternalPlugin {
  pluginType?: string; // module, config, bridge, app
  handleEvent?: (event: unknown) => {};

  //WARN: is this supposed to be this kind of a Promise?
  shutdown?: () => Promise<void>;
}

interface Bridge extends InternalPlugin {
  bridgeName: string;
}

export type { InternalPlugin, Bridge };
