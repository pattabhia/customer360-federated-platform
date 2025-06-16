/**
 * Logger Utility
 * 
 * Provides consistent logging across the gateway
 */

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
};

class Logger {
    constructor() {
        this.level = process.env.LOG_LEVEL || 'INFO';
    }

    formatMessage(level, ...args) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;
        return [prefix, ...args];
    }

    error(...args) {
        console.error(...this.formatMessage(LOG_LEVELS.ERROR, ...args));
    }

    warn(...args) {
        console.warn(...this.formatMessage(LOG_LEVELS.WARN, ...args));
    }

    info(...args) {
        console.log(...this.formatMessage(LOG_LEVELS.INFO, ...args));
    }

    debug(...args) {
        if (this.level === 'DEBUG') {
            console.log(...this.formatMessage(LOG_LEVELS.DEBUG, ...args));
        }
    }
}

export function createLogger() {
    return new Logger();
}

export default createLogger;