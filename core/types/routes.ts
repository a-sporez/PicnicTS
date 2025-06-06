// /core/types/routes.ts
// TODO: refactor 8
import type { RequestBody } from "discord.js";

interface IncomingEvent extends RequestBody {
  // ++
  // files: RawFile[] | undefined;
  // json: unknown;
  // ++
  type: string;
  payload: string;
  meta?: string;
}

export type { IncomingEvent };
