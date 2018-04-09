import { createServer, Server } from "http";
import * as express from "express";
import * as socketIo from "socket.io";

import { ChatMessage } from "./model/message";
import { User } from "./model/user";

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
      console.log("Server listening on port %s", this.port);
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
    this.io.on("connect", (socket: any) => {
      socket.broadcast.emit("join", "Someone joined the room");
      console.log(`Client ${socket.id} connected on port ${this.port}.`);
      this.rename(socket);
      this.join(socket);
      this.message(socket);
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
  private message(socket: any) {
    socket.on("message", (message: any) => {
      console.log("[server](message): %s", JSON.stringify(message));
      this.io.emit("message", message);
    });
  }

  /**
   * Handles when a user disconect, removes user from array
   * 
   * @private
   * @param {*} socket 
   * @memberof ChatServer
   */
  private disconnect(socket: any) {
    socket.on("disconnect", () => {
      console.log(`Client ${socket.id} disconnected on port ${this.port}.`);
      const index = this.users.findIndex(user => user.id === socket.id);
      if (index !== -1) {
        this.users.splice(index, 1);
        this.io.emit("users", this.users);
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
  private rename(socket: any) {
    socket.on("rename", (data: any) => {
      console.log("[server](rename) user renamed %s", JSON.stringify(data));
      const index = this.users.findIndex(user => user.id === data.user.id);
      if (index !== -1) {
        this.users[index].name = data.user.name;
        this.io.emit("users", this.users);
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
  private join(socket: any) {
    socket.on("join", (data: any) => {
      console.log("[server](join) %s joined", JSON.stringify(data));
      socket.emit("id", socket.id);
      this.users.push({ id: socket.id, name: data.from.name, image: data.from.image });
      this.io.emit("users", this.users);
    });
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
