import * as express from 'express';
import { createServer, Server } from 'http';
import * as socketIo from 'socket.io';

import { ChatMessage } from './model/message';
import { User } from './model/user';

/**
 * Chat server class
 *
 * @export
 * @class ChatServer
 */
export class ChatServer {
  public static readonly PORT: number = 3000;
  private app: express.Application;
  private server: Server;
  private io: socketIo.Server;
  private port: string | number;

  private users: User[] = [];
  private messages: ChatMessage[] = [];

  /**
   * Creates an instance of ChatServer.
   * @memberof ChatServer
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this.server = createServer(this.app);
    this.io = socketIo(this.server);
    this.listen();
  }

  /**
   * Server listens to port
   *
   * @private
   * @memberof ChatServer
   */
  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Server listening on port %s', this.port);
    });

    this.connect();
  }

  /**
   * Handles new connection
   *
   * @private
   * @memberof ChatServer
   */
  private connect() {
    this.io.on('connect', (socket: socketIo.Socket) => {
      socket.broadcast.emit('join', 'Someone joined the room');
      socket.emit('messages', this.messages);
      console.log(`Client ${socket.id} connected on port ${this.port}.`);
      this.rename(socket);
      this.join(socket);
      this.message(socket);
      this.privateMessage(socket);
      this.disconnect(socket);
    });
  }

  /**
   * Handles new message
   *
   * @private
   * @param {*} socket
   * @memberof ChatServer
   */
  private message(socket: socketIo.Socket) {
    socket.on('message', (message: any) => {
      console.log('[server](message): %s', JSON.stringify(message));
      this.messages.push(message);
      this.io.emit('message', message);
    });
  }

  /**
   * Handles PM
   *
   * @private
   * @param {*} socket
   * @memberof ChatServer
   */
  private privateMessage(socket: socketIo.Socket) {
    socket.on('privateMessage', (id: string, message: ChatMessage) => {
      console.log(
        '[server](private message): %s to %s',
        JSON.stringify(message),
        id
      );
      this.io.to(id).emit('privateMessage', message);
    });
  }

  /**
   * Handles when a user disconect, removes user from array
   *
   * @private
   * @param {*} socket
   * @memberof ChatServer
   */
  private disconnect(socket: socketIo.Socket) {
    socket.on('disconnect', () => {
      console.log(`Client ${socket.id} disconnected on port ${this.port}.`);
      const index = this.users.findIndex(user => user.id === socket.id);
      if (index !== -1) {
        this.users.splice(index, 1);
        this.io.emit('users', this.users);
      }
    });
  }

  /**
   * Handles user rename, modifies name from user array
   *
   * @private
   * @param {*} socket
   * @memberof ChatServer
   */
  private rename(socket: socketIo.Socket) {
    socket.on('rename', (data: any) => {
      console.log('[server](rename) user renamed %s', JSON.stringify(data));
      const index = this.users.findIndex(user => user.id === data.user.id);
      if (index !== -1) {
        this.users[index].name = data.user.name;
        this.io.emit('users', this.users);
      }
    });
  }
  /**
   * Handles when a new user joins chat
   *
   * @private
   * @param {*} socket
   * @memberof ChatServer
   */
  private join(socket: socketIo.Socket) {
    socket.on('join', (data: any) => {
      console.log('[server](join) %s joined', JSON.stringify(data));
      const newUser = this.getNewUser(socket.id);
      socket.emit('user', newUser);
      this.users.push(newUser);
      this.io.emit('users', this.users);
    });
  }

  /**
   *
   *
   * @private
   * @param {string} id
   * @returns {User}
   * @memberof ChatServer
   */
  private getNewUser(id: string): User {
    return { id: id, name: 'Anonymous', image: this.getRandomImage() };
  }

  /**
   *
   *
   * @returns {string}
   * @memberof ChatServer
   */
  private getRandomImage(): string {
    const collectionId = Math.floor(Math.random() * 100000) + 1;
    return `https://source.unsplash.com/random?sig=${collectionId}`;
  }

  /**
   * Returns app
   *
   * @returns {express.Application}
   * @memberof ChatServer
   */
  public getApp(): express.Application {
    return this.app;
  }
}
