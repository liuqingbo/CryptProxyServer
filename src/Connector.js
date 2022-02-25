import net from 'net';
import { NetHelper } from './utils/NetHelper.js';
import { Logger } from './utils/Logger.js';

export class Connector {
  constructor(c2PSocket) {
    this.activeC2PSocket = c2PSocket;
    this.activeC2PSocket.latestUpdatedAt = Date.now();
    this.bindEventActiveC2PSocket(c2PSocket);
    this.expiredC2PSockets = [];

    this.activeP2RSocket = undefined;
    this.activeP2RSocketReady = false;
    this.expiredP2RSockets = [];

    this.pendingMessages2RealServer = [];

    //todo start timer to clear expired socket and even active socket.
  }

  HandleNewConnect(c2pSocket) {
    if (this.activeC2PSocket
      && (this.activeC2PSocket.remoteAddress === c2pSocket.remoteAddress 
          && this.activeC2PSocket.remotePort === c2pSocket.remotePort)) {
      Logger.LogError('[C2P]New connection was establish while old same connection still existed. SocketInfo=' + NetHelper.GenerateSocketIdString(c2PSocket));
    } else if (this.activeC2PSocket) {
      Logger.LogWarn('[C2P]New connection was establish while old connection still existed. SocketInfo=' 
        + NetHelper.GenerateSocketIdString(c2PSocket) + 'old remote port=' + this.activeC2PSocket.remotePort);
    }

    if (this.activeC2PSocket) {
      this.expiredC2PSockets.push(this.activeC2PSocket);
    }

    this.activeC2PSocket = c2pSocket;
    this.activeC2PSocket.latestUpdatedAt = Date.now();
    this.bindEventActiveC2PSocket(c2pSocket);
  }

  bindEventActiveC2PSocket(c2PSocket) {
    if (!c2PSocket) {
      Logger.LogError('Param error in bindEventActiveC2PSocket');
      return;
    }

    c2PSocket.on('data', (chunk) => {
      c2PSocket.latestUpdatedAt = Date.now();
      const operationCode = this.extractOperationCode(chunk);
      Logger.LogInfo(`[C2P]Receive data[len=${chunk.length}] and operationCode=[${operationCode}] from socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}`);

      switch (operationCode) {
        case 0x04:
          this.handleProxyRequestWithCrypted(chunk);
          break;
        default:
          Loggger.error(`[C2P]Invalid operationCode=[${operationCode}]`);
      }
    });

    c2PSocket.on('close', () => {
      Logger.LogInfo(`[C2P]Close happened in socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}`);
      c2PSocket.removeAllListeners();
      c2PSocket.end();
      if (c2PSocket == this.activeC2PSocket) {
        this.activeC2PSocket = undefined;
      }
    });

    c2PSocket.on('error', (err) => {
      Logger.LogWarn(`[C2P]Error happened in socketInfo=${NetHelper.GenerateSocketIdString(c2PSocket)}, error=${err.toString()}`);
      c2PSocket.removeAllListeners();
      c2PSocket.destroy();
      if (c2PSocket == this.activeC2PSocket) {
        this.activeC2PSocket = undefined;
      }
    });
  }

  handleProxyRequestWithCrypted(chunk) {
    const realAddressInfo = this.extractRealServerAddressInfo(chunk);
    if (!this.activeP2RSocket || this.isNeedReCreateP2RSocket(realAddressInfo)) {
      if (this.activeP2RSocket) {
        this.expiredP2RSockets.push(this.activeP2RSocket);
        this.activeP2RSocket = undefined;
      }

      this.initP2RConnection(realAddressInfo);
    }

    // todo
    const rawContent = chunk
    if (this.activeP2RSocketReady && this.activeP2RSocket) {
      this.activeP2RSocket.write(rawContent);
    } else {
      this.pendingMessages2RealServer.push(rawContent);
    }
  }

  extractOperationCode(chunk) {
    //todo
    return 0x04;
  }

  extractRealServerAddressInfo(chunk) {
    // todo
    return {
      realSIP: '127.0.0.1',
      realSPort: 1337
    }
  }

  isNeedReCreateP2RSocket(realSAddressInfo) {
    if (!this.activeP2RSocket) {
      return true;
    }

    return (this.activeP2RSocket.remoteAddress !== realSAddressInfo.realSIP || this.activeP2RSocket.remotePort !== realSAddressInfo.realSPort);
  }

  initP2RConnection(realAddressInfo) {
    this.activeP2RSocketReady = false;
    const p2RSocket = net.connect({ port: realAddressInfo.realSPort, host: realAddressInfo.realSIP }, () => {
      p2RSocket.on('data', (chunk) => {
        p2RSocket.latestUpdatedAt = Date.now();
        Logger.LogInfo(`[P2R]Receive data[len=${chunk.length}] from socketInfo=${NetHelper.GenerateSocketIdString(p2RSocket)}`);

        if (this.activeC2PSocket) {
          this.activeC2PSocket.write(chunk);
        }
      });

      p2RSocket.on('close', () => {
        Logger.LogInfo(`[P2R]Close Event from socketInfo=${NetHelper.GenerateSocketIdString(p2RSocket)}`);
        p2RSocket.end();
        p2RSocket.removeAllListeners();
        if (p2RSocket == this.activeP2RSocket) {
          this.activeP2RSocket = undefined;
        }
      });

      p2RSocket.on('error', (err) => {
        Logger.LogWarn(`[P2R]Error happened in socketInfo=${NetHelper.GenerateSocketIdString(p2RSocket)}, error=${err.toString()}`);
        p2RSocket.destroy();
        p2RSocket.removeAllListeners();
        if (p2RSocket == this.activeP2RSocket) {
          this.activeP2RSocket = undefined;
        }
      });

      let itertaionTimes = this.pendingMessages2RealServer.length;
      while (itertaionTimes > 0) {
          const msg2RealServer = this.pendingMessages2RealServer[0];
          if (p2RSocket) {
            p2RSocket.write(msg2RealServer);
            this.pendingMessages2RealServer.splice(0, 1);
          }

          itertaionTimes--;
      }

      this.activeP2RSocketReady = true;
    });

    this.activeP2RSocket = p2RSocket;
    this.activeP2RSocket.latestUpdatedAt = Date.now();
  }
}
