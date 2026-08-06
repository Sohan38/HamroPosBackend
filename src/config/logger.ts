export const logger = {
    info: (...messages: unknown[]) => console.info('[INFO]', ...messages),
    warn: (...messages: unknown[]) => console.warn('[WARN]', ...messages),
    error: (...messages: unknown[]) => console.error('[ERROR]', ...messages),
};
