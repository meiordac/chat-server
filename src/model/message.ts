import { User } from "./user";

export class ChatMessage {
    constructor(public from: User, public content: string) {}
}