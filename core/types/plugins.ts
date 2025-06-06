// /core/types/plugins.ts
// TODO: refactor 7
import type { IncomingEvent } from "./routes";

interface InternalPlugin {
  pluginType?: string; // module, config, bridge, app
  handleEvent?: (event: IncomingEvent) => Promise<void>;

  // WARN: is this supposed to be this kind of a Promise?
  shutdown?: () => Promise<void>;
}

interface Bridge extends InternalPlugin {
  readonly bridgeName: string;
}

export type { InternalPlugin, Bridge };
