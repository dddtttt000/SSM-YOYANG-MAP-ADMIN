/**
 * Environment-aware logger utility
 * In development: console functions work normally
 * In production: console functions are disabled for security and performance
 */

const isDevelopment = import.meta.env.MODE === 'development'

interface Logger {
  log: (...args: any[]) => void
  error: (...args: any[]) => void
  warn: (...args: any[]) => void
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
}

export const logger: Logger = {
  log: isDevelopment ? console.log.bind(console) : () => {},
  error: isDevelopment ? console.error.bind(console) : () => {},
  warn: isDevelopment ? console.warn.bind(console) : () => {},
  info: isDevelopment ? console.info.bind(console) : () => {},
  debug: isDevelopment ? console.debug.bind(console) : () => {}
}

// Export individual functions for easier migration
export const { log, error, warn, info, debug } = logger

export default logger