export class NetHelper {
    static GenerateSocketIdString(socket) {
        return `R_${socket.remoteAddress}_${socket.remotePort}_L_${socket.localAddress}_${socket.localPort}`;
    }
}