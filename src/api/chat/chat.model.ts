import { Schema, model, Types } from "mongoose";
import { Conversation, Message } from "./chat.entity";

interface ConversationDocument extends Omit<Conversation, 'id' | 'product' | 'buyer' | 'seller' | 'unReadCount'> {
    product: Types.ObjectId;
    buyer: Types.ObjectId;
    seller: Types.ObjectId;
}

interface MessageDocument extends Omit<Message, 'id' | 'conversation' | 'sender'> {
    conversation: Types.ObjectId;
    sender: Types.ObjectId;
}

const ConversationSchema = new Schema<ConversationDocument>({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    buyer: { type: Schema.Types.ObjectId, ref: 'user' },
    seller: { type: Schema.Types.ObjectId, ref: 'user' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// una sola conversazione per coppia prodotto + compratore
ConversationSchema.index({ product: 1, buyer: 1 }, { unique: true });

// "le mie conversazioni", ordinate per ultimo messaggio
ConversationSchema.index({ buyer: 1, lastMessageAt: -1 });
ConversationSchema.index({ seller: 1, lastMessageAt: -1 });

const MessageSchema = new Schema<MessageDocument>({
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    sender: { type: Schema.Types.ObjectId, ref: 'user' },
    text: { type: String, maxLength: 1000 },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

//storico di una conversazione, paginato
MessageSchema.index({ conversation: 1, createdAt: -1 });

const conversationTransform = (_: any, ret: any) => ({
    id: ret.id,
    product: ret.product,
    buyer: ret.buyer,
    seller: ret.seller,
    lastMessage: ret.lastMessage,
    lastMessageAt: ret.lastMessageAt,
    createdAt: ret.createdAt
});

const messaggeTransform = (_: any, ret: any) => ({
    id: ret.id,
    conversation: ret.conversation,
    sender: ret.sender,
    text: ret.text,
    read: ret.read,
    createdAt: ret.createdAt
});

ConversationSchema.set('toJSON', { virtuals: true, transform: conversationTransform });
ConversationSchema.set('toObject', { virtuals: true, transform: conversationTransform });

MessageSchema.set('toJSON', { virtuals: true, transform: messaggeTransform });
MessageSchema.set('toObject', { virtuals: true, transform: messaggeTransform });

export const ConversationModel = model<ConversationDocument>('Conversation', ConversationSchema);
export const MessageModel = model<MessageDocument>('Message', MessageSchema);