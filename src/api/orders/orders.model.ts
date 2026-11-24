import { Schema, model, Types } from "mongoose";
import { order, orderStatus } from "./orders.entity";

const ORDER_STATUS: orderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

interface orderDocument extends Omit<order, 'id' | 'product' | 'buyer' | 'seller'> {
    product: Types.ObjectId,
    buyer: Types.ObjectId,
    seller: Types.ObjectId
}

const orderSchema = new Schema<orderDocument>({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    productSnapshot: {
        type: {
            title: { type: String },
            image: { type: String },
            price: { type: Number, min: 1 }
        },
        _id: false
    },
    buyer: { type: Schema.Types.ObjectId, ref: 'user' },
    seller: { type: Schema.Types.ObjectId, ref: 'user' },
    amount: { type: Number, min: 1 },
    currency: { type: String, default: 'eur' },
    status: { type: String, enum: ORDER_STATUS, default: 'pending' },
    shippingAddress: {
        type: {
            fullName: { type: String },
            street: { type: String },
            city: { type: String },
            country: { type: String, uppercase: true },
            phone: { type: String }
        },
        _id: false
    },
    trackingCode: { type: String },
    carrier: { type: String },
    paymentId: { type: String },
    captureId: { type: String },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

//"i miei acquisti" e "le mie vendite", dal più recente
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });

//controllo degli ordini già aperti su un prodotto
orderSchema.index({ product: 1, status: 1 });

//il webhook ritrova l'ordine dalla sessione Stripe (sparso: gli ordini senza sessione non contano)
orderSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

const transform = (_: any, ret: any) => ({
    id: ret.id,
    product: ret.product,
    productSnapshot: ret.productSnapshot,
    buyer: ret.buyer,
    seller: ret.seller,
    amount: ret.amount,
    currency: ret.currency,
    status: ret.status,
    shippingAddress: ret.shippingAddress,
    trackingCode: ret.trackingCode,
    carrier: ret.carrier,
    paidAt: ret.paidAt,
    shippedAt: ret.shippedAt,
    deliveredAt: ret.deliveredAt,
    createdAt: ret.createdAt
});

orderSchema.set('toJSON', { virtuals: true, transform });
orderSchema.set('toObject', { virtuals: true, transform });

export const orderModel = model<orderDocument>('order', orderSchema);