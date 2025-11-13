import { logger } from '../logger';

describe('Logger Service', () => {
  it('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should log info messages', () => {
    const spy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(spy).toHaveBeenCalledWith('Test info message');
    spy.mockRestore();
  });

  it('should log error messages', () => {
    const spy = jest.spyOn(logger, 'error');
    logger.error('Test error message');
    expect(spy).toHaveBeenCalledWith('Test error message');
    spy.mockRestore();
  });

  it('should log warn messages', () => {
    const spy = jest.spyOn(logger, 'warn');
    logger.warn('Test warn message');
    expect(spy).toHaveBeenCalledWith('Test warn message');
    spy.mockRestore();
  });
});

