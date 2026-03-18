import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const colors: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const reset = '\x1b[0m';

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  if (level === 'debug' && env.NODE_ENV === 'production') return;
  const timestamp = new Date().toISOString();
  const color = colors[level];
  console.log(`${color}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}`, ...args);
};

export const logger = {
  debug: (msg: string, ...args: unknown[]) => log('debug', msg, ...args),
  info: (msg: string, ...args: unknown[]) => log('info', msg, ...args),
  warn: (msg: string, ...args: unknown[]) => log('warn', msg, ...args),
  error: (msg: string, ...args: unknown[]) => log('error', msg, ...args),
};
