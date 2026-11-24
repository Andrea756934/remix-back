import { Schema, model, Types } from "mongoose";
import { review } from "./reviews.entity";

interface reviewDocument extends Omit<review, 'id' | 'order' | 'author' | 'target'> {
    order: Types.ObjectId;
    author: Types.ObjectId;
    target: Types.ObjectId;
}

const reviewSchema = new Schema<reviewDocument>({
    order: { type: Schema.Types.ObjectId, ref: 'order' },
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    targetType: { type: String, enum: ['user', 'product'] },
    target: { type: Schema.Types.ObjectId },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxLength: 500 },
    createdAt: { type: Date, default: Date.now }
});

//una sola recensione per ordine
reviewSchema.index({ author: 1, targetType: 1, target: 1 }, { unique: true });

//recensioni ricevute da un utente, dalla più recente
reviewSchema.index({ targetType: 1, target: 1, createdAt: -1 });

const transform = (_: any, ret: any) => ({
    id: ret.id,
    order: ret.order,
    author: ret.author,
    targetType: ret.targetType,
    target: ret.target,
    rating: ret.rating,
    comment: ret.comment,
    createdAt: ret.createdAt
});

reviewSchema.set('toJSON', { virtuals: true, transform });
reviewSchema.set('toObject', { virtuals: true, transform });

export const reviewModel = model<reviewDocument>('review', reviewSchema);