
import net from 'net';
import { NetHelper } from './utils/NetHelper.js';
import { Logger } from './utils/Logger.js';

const RealServerIP = '127.0.0.1';
const RealServerPort = 1337;

const ProxyServerIP = '127.0.0.1';
const ProxyServerPort = 1336;

var ProxyServer = net.createServer((c2PSocket) => {
    Logger.LogConsole('A new connection was establish from client, socketInfo=' + NetHelper.GenerateSocketIdString(c2PSocket));

    let p2RSocket = undefined;
    let isp2RSocketReady = false;
    const pendingMessages2RealServer = [];
    c2PSocket.on('data', (chunk) => {
        Logger.LogConsole(`Receive data[len=${chunk.length}] from socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}`);
        Logger.LogConsole('Received data is: ' + chunk.toString());
        if (!p2RSocket || isNeedReCreateP2RSocket()) {
            if (p2RSocket) {
                // legacy p2RSocket exist, needed destroy first.
                p2RSocket.destroy();
                p2RSocket = undefined;
            }

            p2RSocket = net.connect({ port: RealServerPort, host: RealServerIP }, () => {
                p2RSocket.on('data', () => {

                });

                p2RSocket.on('close', () => {
                    p2RSocket.end();
                    p2RSocket = undefined;
                    
                });

                p2RSocket.on('error', () => {
                    p2RSocket.destroy();
                    p2RSocket = undefined;
                });

                isp2RSocketReady = true;

                let itertaionTimes = pendingMessages2RealServer.length;
                while (itertaionTimes > 0) {
                    const msg2RealServer = pendingMessages2RealServer[0];
                    if (p2RSocket) {
                        p2RSocket.write(msg2RealServer);  
                        pendingMessage2RealServer.splice(0, 1);  
                    }

                    itertaionTimes--;
                }
            });
    
        }

        if (isp2RSocketReady && p2RSocket) {
            p2RSocket.write(chunk);
        } else {
            pendingMessage2RealServer.push(chunk);
        }
    });

    c2PSocket.on('close', () => {
        Logger.LogConsole(`Close happened in socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}`);
        c2PSocket.end();
    });

    c2PSocket.on('error', (err) => {
        Logger.LogConsole(`Error happened in socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}, error=${err.toString()}`);
        c2PSocket.destroy();
    });
});

function isNeedReCreateP2RSocket() {
    return false;
}

ProxyServer.listen(ProxyServerPort, ProxyServerIP);