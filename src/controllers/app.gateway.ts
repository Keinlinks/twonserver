import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  offers = {};
  @WebSocketServer() server: Server;
  map: Map<string, string> = new Map();
  constructor() {}
  handleDisconnect(client: Socket) {
    this.map.delete(client.id);
  }
  handleConnection(client: Socket) {
    console.log('user connected: ', client.id);
    client.on('message', (data) => {
      if (data) {
        switch (data.type) {
          case 'offer':
            let offerPacket = {
              sdp: data.sdp,
              peerId: client.id,
              type: 'offer',
            };
            if (this.map.get(data.peerId) == '') {
              this.map.set(data.peerId, client.id);
              this.map.set(client.id, data.peerId);
              console.log('emitiendo a: ' + data.peerId);
              client.to(data.peerId).emit('message', offerPacket);
            } else {
              client.send({
                type: 'error',
                message: 'usuario ocupado',
              });
            }
            break;
          case 'answer':
            let answerPacket = { sdp: data.sdp, type: 'answer' };
            client.to(this.map.get(client.id)).emit('message', answerPacket);
            break;
          case 'ice':
            let candidatePacket = {
              ice: data.ice,
              peerId: client.id,
              type: 'ice',
            };
            let sendTo: string = '';
            if (data.isAdmin) {
              sendTo = this.map.get(client.id);
            } else {
              let a = Array.from(this.map.entries()).find((s) => {
                return s[1] == client.id;
              });
              if (a) sendTo = a[0];
            }
            client.to(sendTo).emit('message', candidatePacket);

            break;
        }
      } else {
        client.send('dato no apto');
      }
    });
    let sessionInfo = { id: client.id, type: 'join_room' };
    this.map.set(client.id, '');
    client.send(sessionInfo);
  }
}
