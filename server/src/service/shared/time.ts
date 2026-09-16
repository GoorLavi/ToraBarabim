import { z } from 'zod';

// 'HH:mm', zero-padded, 24-hour. Shared by every schema that accepts a
// lesson's or an exception's start time.
export const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "expected 'HH:mm'");
