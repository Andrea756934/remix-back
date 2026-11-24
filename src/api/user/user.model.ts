import { model, Schema } from "mongoose";
import { user } from "./user.entity";

const addressSchema = new Schema({
    fullname: { type: String },
    street: { type: String },
    city: { type: String },
    country: { type: String },
    phone: { type: String }
})

const userSchema = new Schema<user>({
    firstName: String,
    lastName: String,
    picture: String,
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
    picture: ret.picture
});

userSchema.set('toJSON', { virtuals: true, transform });
userSchema.set('toObject', { virtuals: true, transform });

export const userModel = model<user>('user', userSchema);