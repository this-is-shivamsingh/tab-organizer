class Logger {
  static LOG_LEVELS = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4
  };

  constructor(logLevel) {
    if (logLevel < 1 || logLevel > 4) {
      throw new Error('Log level must be between 1 and 4');
    }
    this.logLevel = logLevel;
  }

  debug(content) {
    if (this.logLevel <= Logger.LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG]: ${content}`);
    }
  }

  info(content) {
    if (this.logLevel <= Logger.LOG_LEVELS.INFO) {
      console.log(`[INFO]: ${content}`);
    }
  }

  warn(content) {
    if (this.logLevel <= Logger.LOG_LEVELS.WARN) {
      console.warn(`[WARN]: ${content}`);
    }
  }

  error(content) {
    if (this.logLevel <= Logger.LOG_LEVELS.ERROR) {
      console.error(`[ERROR]: ${content}`);
    }
  }
}
