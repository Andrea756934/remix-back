import { model, Schema, Types } from "mongoose";
import { user } from "./user.entity";

const addressSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, uppercase: true },
    phone: { type: String, trim: true }
});

const userSchema = new Schema<user>({
    firstName: String,
    lastName: String,
    picture: String,
    // select: false: l'email si carica solo con .select('+email')
    email: { type: String, lowercase: true, trim: true, select: false },
    createdAt: { type: Date, default: Date.now },
    addresses: { type: [addressSchema], default: [] },
    deletedAt: { type: Date }
});

userSchema.virtual('fullname').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const transform = (_: any, ret: any) => ({
    id: ret.id,
    firstName: ret.firstName,
    lastName: ret.lastName,
    fullname: ret.fullname,
    picture: ret.picture,
    email: ret.email,
    createdAt: ret.createdAt,
    addresses: ret.addresses?.map((a: any) => ({
        id: a.id,
        fullName: a.fullName,
        street: a.street,
        city: a.city,
        country: a.country,
        phone: a.phone
    }))
});

userSchema.set('toJSON', { virtuals: true, transform });
userSchema.set('toObject', { virtuals: true, transform });

export const userModel = model<user>('user', userSchema);