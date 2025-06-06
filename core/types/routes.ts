// /core/types/routes.ts
// TODO: refactor 8
import type { RequestBody } from "discord.js";

interface APIReply {}
interface EventPayload {
  user: string;
  message: string;
  channelId: string;
}

interface IncomingEvent extends RequestBody {
  // ++
  // files: RawFile[] | undefined;
  // json: unknown;
  // ++
  type: string;
  payload: EventPayload;
  meta?: string;
}

export type { IncomingEvent };
