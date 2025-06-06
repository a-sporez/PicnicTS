// /core/types/routes.ts
// TODO: refactor 8
import type { RequestBody } from "discord.js";

interface BotAPIResponse {
  reply: string;
}

interface EventPayload {
  user: string;
  message: string;
  channelId: string;
}

interface ChatLogEntry {
  user: string;
  message: string;
  timestamp: number;
  clientId: string;
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

export type { IncomingEvent, BotAPIResponse, ChatLogEntry };
