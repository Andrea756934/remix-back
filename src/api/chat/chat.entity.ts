import { Product } from "../prodotti/prodotti.entity";
import { user } from "../user/user.entity";

export type Message = {
    id: string,
    conversation: string,
    sender: string,
    text: string,
    read: boolean,
    createdAt: Date
}

export type Conversation = {
    id: string,
    product: string | Product,
    buyer: string | user,
    seller: string | user,
    lastMessage?: string,
    lastMessageAt?: Date,
    unReadCount?: number,
    createdAt: Date
}

export type MessageList = {
    items: Message[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
}