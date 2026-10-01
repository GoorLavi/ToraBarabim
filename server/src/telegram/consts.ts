// Bounds one alert so a slow Telegram cannot hold a visitor's request open
// for long. Applied to the whole request, connect and body included.
export const TELEGRAM_TIMEOUT_MS = 3000;

export const TELEGRAM_API_ORIGIN = 'https://api.telegram.org';
