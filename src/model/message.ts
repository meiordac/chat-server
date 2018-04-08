import { User } from "./user";

/**
 * Chat message class, has a from user and content string
 * 
 * @export
 * @class ChatMessage
 */
export class ChatMessage {
    constructor(public from: User, public content: string) {}
}