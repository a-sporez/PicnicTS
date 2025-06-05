// plugins/client_config/index.js
//
// in memory config store
const configs = new Map();

// TODO: turn this into a type
let contextReference: null | unknown = null; // store context for later use

module.exports = {
  name: "client_config",

  init: async context => {
    contextReference = context; // save context reference
    context.logger.log("[client_config] Initialized.");
  },

  handle_event: async event => {
    const { type, payload } = event;

    if (!payload?.clientId) return;

    if (type === "client::config:update") {
      const current = configs.get(payload.clientId) || {};
      const updated = { ...current, ...payload.config };
      configs.set(payload.clientId, updated);

      console.log(
        `[client_config] Config for ${payload.clientId} updated:`,
        updated
      );

      // notify other modules (including frontend)
      // WARN: does contextReference exist?
      (contextReference as any).emit({
        type: "client::config:changed",
        payload: { clientId: payload.clientId, config: updated },
        meta: { plugin: "client_config" },
      });
    }

    if (type === "client::config:get") {
      const current = configs.get(payload.clientId) || {};
      console.log(
        `[client_config] returning config for ${payload.clientId}:`,
        current
      );
    }
  },

  shutdown: async () => {
    console.log("[client_config] shutting down.");
  },
};
