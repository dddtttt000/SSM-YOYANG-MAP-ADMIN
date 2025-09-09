import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Logger', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    }
    // Clear module cache before each test
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Development mode', () => {
    it('should log messages in development mode', async () => {
      // Mock environment before importing
      vi.stubEnv('MODE', 'development')
      
      const { logger } = await import('../logger')
      
      logger.log('test log')
      logger.error('test error')
      logger.warn('test warn')
      logger.info('test info')
      logger.debug('test debug')

      expect(consoleSpy.log).toHaveBeenCalledWith('test log')
      expect(consoleSpy.error).toHaveBeenCalledWith('test error')
      expect(consoleSpy.warn).toHaveBeenCalledWith('test warn')
      expect(consoleSpy.info).toHaveBeenCalledWith('test info')
      expect(consoleSpy.debug).toHaveBeenCalledWith('test debug')
    })
  })

  describe('Production mode', () => {
    it('should not log messages in production mode', async () => {
      vi.stubEnv('MODE', 'production')
      
      const { logger } = await import('../logger')
      
      logger.log('test log')
      logger.error('test error')
      logger.warn('test warn')
      logger.info('test info')
      logger.debug('test debug')

      expect(consoleSpy.log).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.debug).not.toHaveBeenCalled()
    })
  })

  describe('Test mode', () => {
    it('should not log messages in test mode by default', async () => {
      // Test mode should not log (MODE !== 'development')
      vi.stubEnv('MODE', 'test')
      
      const { logger } = await import('../logger')
      
      logger.log('test log')
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })

  describe('Logger interface', () => {
    it('should provide all logging methods', async () => {
      vi.stubEnv('MODE', 'development')
      
      const { logger } = await import('../logger')
      
      expect(typeof logger.log).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })
  })
})