import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
    ConnectedSocket
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class EventsGateway {
    @WebSocketServer()
    server: Server;

    // @SubscribeMessage('events')
    // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    //     return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    // }

    // @SubscribeMessage('identity')
    // async identity(@MessageBody() data: number): Promise<number> {
    //     return data;
    // }

    @SubscribeMessage('joinRoom')
    async joinRoom(@MessageBody() roomName: string, @ConnectedSocket() client: Socket): Promise<void> {
        console.log("new join:", roomName);
        client.join(roomName);
        await this.broadcastToRoom(roomName, "newuser", "New user Joined");
    }

    @SubscribeMessage('shareContent')
    async shareToAll(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<void> {
        console.log("new content:", data.roomName);
        await this.broadcastToRoom(data.roomName, "newcontent", data);
    }

    private async broadcastToRoom(roomName: string, event: string, message: any): Promise<void> {
        this.server.to(roomName).emit(event, message);
    }
}