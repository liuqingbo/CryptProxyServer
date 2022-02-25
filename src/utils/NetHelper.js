export class NetHelper {
  static GenerateSocketIdString(socket) {
    if (!socket) {
      return 'ERROR undefined socket passed in GenerateSocketIdString.';
    }

    return `R_${socket.remoteAddress}_${socket.remotePort}_L_${socket.localAddress}_${socket.localPort}`;
  }
}