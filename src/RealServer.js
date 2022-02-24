
import net from 'net';
import { NetHelper } from './utils/NetHelper.js';
import { Logger } from './utils/Logger.js';

const RealServerIP = '127.0.0.1';
const RealServerPort = 1337;


var server = net.createServer((socket) => {
    Logger.LogConsole('A new connection was establish to real server, socketInfo=' + NetHelper.GenerateSocketIdString(socket));

    socket.on('data', (chunk) => {
        Logger.LogConsole(`Receive data[len=${chunk.length}] from socketInfo=${NetHelper.GenerateSocketIdString(socket)}`);
        Logger.LogConsole('Received data is: ' + chunk.toString());

        socket.write('Mocked response data from real server.');
    });

    socket.on('close', () => {
        Logger.LogConsole(`Close happened in socketInfo=${NetHelper.GenerateSocketIdString(socket)}`);
        socket.end();
    });

    socket.on('error', (err) => {
        Logger.LogConsole(`Error happened in socketInfo=${NetHelper.GenerateSocketIdString(socket)}, error=${err.toString()}`);
        socket.destroy();
    });
});

server.listen(RealServerPort, RealServerIP);