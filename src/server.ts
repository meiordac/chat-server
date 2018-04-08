import { createServer, Server } from "http";
import * as express from "express";
import * as socketIo from "socket.io";

import { ChatMessage } from "./model/message";
import { User } from "./model/user";

export class ChatServer {
  public static readonly PORT: number = 8080;
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
      console.log("Server listening on port %s", this.port);
    });

    this.io.on("connect", (socket: any) => {
      socket.broadcast.emit("join", "Someone joined the room");
      console.log(`Client ${socket.id} connected on port ${this.port}.`);

      socket.on("rename", (data: any) => {
        console.log("[server](rename) user renamed %s", JSON.stringify(data));
        const index = this.users.findIndex(
          user => user.id === data.user.id
        );
        if (index !== -1) {
          this.users[index].name = data.user.name;
          this.io.emit("users", this.users);
        }
      });

      socket.on("join", (data: any) => {
        console.log("[server](join) %s joined", JSON.stringify(data));
        socket.emit("id", socket.id);
        this.users.push({ id: socket.id, name: data.from.name });
        this.io.emit("users", this.users);
      });

      socket.on("message", (message: any) => {
        console.log("[server](message): %s", JSON.stringify(message));
        this.io.emit("message", message);
      });

      socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected on port ${this.port}.`);
        const index = this.users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
          this.users.splice(index, 1);
          this.io.emit("users", this.users);
        }
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
