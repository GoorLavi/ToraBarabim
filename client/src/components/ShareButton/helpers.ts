// WhatsApp and the system sheet read the link best as the last line of one
// text, never as a separate `url` field.
export const textWithUrlOnLastLine = (text: string, url: string): string => `${text}\n${url}`;

// Closing the share sheet rejects with an `AbortError`: a choice, not a
// failure.
export const isShareDismissal = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';
