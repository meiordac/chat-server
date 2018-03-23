import { User } from "./user";

export class Message {
    constructor(from: User, content: string) {}
}

export class ChatMessage extends Message {
    constructor(from: User, content: string) {
        super(from, content);
    }
}