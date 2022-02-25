export class Logger {
  static LogDebug(content) {
    console.debug(`[${getDateStr()}] DEBUG ${content}`);
  }

  static LogInfo(content) {
    console.info(`[${getDateStr()}] INFO ${content}`);
  }

  static LogError(content) {
    console.error(`[${getDateStr()}] ERROR ${content}`);
  }

  static LogWarn(content) {
    console.warn(`[${getDateStr()}] WARN ${content}`);
  }

}

function getDateStr() {
  return (new Date()).toLocaleString();
}
