var net = require('net');
//获取本地时间字符串
function getDateStr() {
    return (new Date()).toLocaleString();
}
// 创建TCP代理
function proxyTCP(key, conf) {
    let [bind, server] = [conf.bind, conf.server];
    let tcpServer = net.createServer((c) => {
        console.info(`[${getDateStr()}] [${key}] [INFO] - TCP Client connect ${c.remoteAddress}:${c.remotePort}`);
        let client = net.connect({ port: server[1], host: server[0] }, () => {
            c.pipe(client);
        });
        client.pipe(c);
        client.on('error', (err) => {
            console.error(`[${getDateStr()}] [${key}] [ERROR] - ${err}`);
            c.destroy();
        });
        c.on('error', (err) => {
            console.error(`[${getDateStr()}] [${key}] [ERROR] -  ${err}`);
            client.destroy();
        });
    });
    tcpServer.listen({ host: bind[0], port: bind[1], }, () => {
        console.info(`[${getDateStr()}] [${key}] [INFO] - TCP Server start ${bind[0]}:${bind[1]}`);
    });
    return tcpServer;
}

const proxyConfig = {
    "测试机 1.21": {
        mode: "tcp",
        bind: ["0.0.0.0", 8087],
        server: ['192.168.1.21', 9003]
    },
    "远程桌面 1.21": {
        mode: "tcp",
        bind: ["0.0.0.0", 13389],
        server: ['192.168.1.21', 3389]
    },
    "路由器 1.1": {
        mode: "tcp",
        bind: ["0.0.0.0", 8080],
        server: ['192.168.1.1', 80]
    }
};

const servers = {};

for (let k in proxyConfig) {
    let conf = proxyConfig[k];
    if (conf.mode == "tcp") {
        servers[k] = proxyTCP(k, conf);
    }
}