import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { ChatMessage } from './model/message';
import { User } from './model/user';

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: socketIo.Server;
    private port: string | number;
    private users: User[] = [];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Server listening on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            socket.broadcast.emit('join', 'Someone joined the room');
            console.log('Client connected on port %s.', this.port);

            socket.on('rename', (data: any) => {
                console.log('user renamed %s', data);
            }
        );
        
            socket.on('join', (data: any) => {
                console.log('user joined %s', data);
            }
        );

            socket.on('message', (message: any) => {
                console.log('[server](message): %s', JSON.stringify(message));
                if(this.users.indexOf(message.from) !== -1) {
                    this.users.push(message.from);
                    this.io.emit('users', this.users);
                }
                this.io.emit('message', message);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected on port %s.', this.port);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
