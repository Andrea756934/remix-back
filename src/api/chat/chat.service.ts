import { ConversationModel, MessageModel } from "./chat.model";
import { Conversation, Message, MessageList } from "./chat.entity";
import { productModel } from "../prodotti/prodotti.model";
import { NotFoundError } from "../../errors/not-found.error";
import { selfConversationError } from "../../errors/self-conversation.error";
import { Types } from "mongoose";

export class chatService {
    async find(userId: string): Promise<Conversation[]> {
        const conversations = await ConversationModel
            .find({ $or: [{ buyer: userId }, { seller: userId }] })
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .populate(['product', 'buyer', 'seller']);

        const unread = await MessageModel.aggregate([
            {
                $match: {
                    conversation: { $in: conversations.map(conversation => conversation.id) },
                    sender: { $ne: new Types.ObjectId(userId) },
                    read: false
                }
            },
            { $group: { _id: '$conversation', count: { $sum: 1 } } }
        ]);

        return conversations.map(conversation => {
            const found = unread.find(item => item._id.toString() === conversation.id);
            return this.conversationResponse(conversation, found?.count ?? 0);
        });
    }

    async getMessage(
        conversationId: string,
        userId: string,
        page: number = 1,
        limit: number = 20): Promise<MessageList> {
        const conversation = await this.participantConversation(conversationId, userId);

        await MessageModel.updateMany(
            { conversation: conversation._id, sender: { $ne: userId }, read: false },
            { read: true }
        );

        const [messages, total] = await Promise.all([
            MessageModel.find({ conversation: conversation._id })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            MessageModel.countDocuments({ conversation: conversation._id })
        ]);

        return {
            items: messages.map(message => this.messageResponse(message)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async add(productId: string, buyerId: string): Promise<Conversation> {
        const product = await productModel.findById(productId);

        if (!product) {
            throw new NotFoundError();
        }

        if (product.idSeller.toString() === buyerId) {
            throw new selfConversationError();
        }

        const filter = { product: productId, buyer: buyerId };

        let conversation = await ConversationModel.findOne(filter);
        if (!conversation) {
            try {
                conversation = await ConversationModel.create({ ...filter, seller: product.idSeller });
            }
            catch (err: any) {
                if (err.code !== 11000) {
                    throw err;
                }

                conversation = await ConversationModel.findOne(filter);
            }
        }

        await conversation!.populate(['product', 'buyer', 'seller']);
        return this.conversationResponse(conversation, 0);
    }

    async send(conversationId: string, userId: string, text: string): Promise<Message> {
        const conversation = await this.participantConversation(conversationId, userId);

        const message = await MessageModel.create({
            conversation: conversation._id,
            sender: userId,
            text
        });

        conversation.lastMessage = message.text;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        return this.messageResponse(message);
    }

    private async participantConversation(conversationId: string, userId: string) {
        if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
            throw new NotFoundError();
        }

        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            $or: [{ buyer: userId }, { seller: userId }]
        });

        if (!conversation) {
            throw new NotFoundError();
        }

        return conversation;
    }

    private conversationResponse(conversation: any, unReadCount: number): Conversation {
        const object = conversation.toObject();
        return { ...object, unReadCount } as Conversation;
    }

    private messageResponse(message: any): Message {
        return message.toObject() as Message;
    }
}

export default new chatService();