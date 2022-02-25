
import net from 'net';
import { NetHelper } from './utils/NetHelper.js';
import { Logger } from './utils/Logger.js';
import { Connector } from './Connector.js';

const ProxyServerIP = '127.0.0.1';
const ProxyServerPort = 1336;

// Key is client's ip, value is Connector object
const ConnectorsMap = new Map();

const ProxyServer = net.createServer((c2PSocket) => {
  Logger.LogInfo('A new connection was establish from client, socketInfo=' + NetHelper.GenerateSocketIdString(c2PSocket));

  if (c2PSocket && c2PSocket.remoteAddress) {
    const existingConnector = ConnectorsMap.get(c2PSocket.remoteAddress);
    if (existingConnector) {
      existingConnector.HandleNewConnect(c2PSocket);
    } else {
      ConnectorsMap.set(c2PSocket.remoteAddress, new Connector(c2PSocket));
    }
  } else {
    Logger.LogError('Received connect but failed to get remoteAddress from c2PSocket.')
  }
});

ProxyServer.listen(ProxyServerPort, ProxyServerIP);