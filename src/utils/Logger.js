export class Logger {
    static LogConsole(content) {
        console.info(`[${getDateStr()}] ${content}`);
    }
}

function getDateStr() {
    return (new Date()).toLocaleString();
}
