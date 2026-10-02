import { loadConfig } from '../config';
import { createTelegramClient } from './client';
import type { TelegramClient } from './models';

// Wraps one external system, so it default-exports a singleton object (the
// shape `storage/storage.ts` has) and a test replaces `sendMessage` on it.
const telegram: TelegramClient = createTelegramClient(loadConfig(process.env).telegram);

export default telegram;
