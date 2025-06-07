// /server.ts
// TODO: fix body-parser dependency
import express from "express";
import bodyParser from "body-parser";

import { createContext } from "./core/context";
import type { IncomingEvent } from "./core/types/routes";

require("dotenv").config();

const app = express();
const port = 8080;

const context = createContext();

// POST /events/incoming
app.use(bodyParser.json());
//@ts-expect-error
app.post("/events/incoming", (req, res) => {
  const { type, payload }: IncomingEvent = req.body;

  if (!type) {
    return res
      .status(400)
      .json({ error: 'missing "type" field' });
  }

  context.logger.log(`[API] Injected event: ${type}`);
  context.emit({ type, payload });

  res.status(201).json({ success: true });
});

app.listen(port, () => {
  console.log(`[API] listening on http://localhost:${port}`);
});
