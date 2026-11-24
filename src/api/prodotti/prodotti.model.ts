import { Schema, Types, model } from "mongoose";
import { Product, ProductCondition, ProductStatus } from "./prodotti.entity";

interface ProductDocument extends Omit<Product, 'id' | 'idSeller'> {
    idSeller: Types.ObjectId;
}

const PRODUCT_CONDITIONS: ProductCondition[] = [
    'new_with_tag',
    'new',
    'very_good',
    'good',
    'satisfactory'
];

const product_status: ProductStatus[] = ['active', 'sold', 'paused'];

const ProductSchema = new Schema<ProductDocument>({
    idSeller: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, maxlength: 80 },
    description: { type: String, maxlength: 2000 },
    price: { type: Number, min: 0.5 },
    category: { type: String },
    condition: { type: String, enum: PRODUCT_CONDITIONS },
    brand: { type: String, },
    size: { type: String, },
    images: {
        type: [String],
        validate: (v: string[]) => v.length >= 1 && v.length <= 5
    },
    status: { type: String, enum: product_status, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

ProductSchema.index(
    { title: 'text', description: 'text', brand: 'text' },
    { weights: { title: 10, brand: 5, desciption: 1 } }
);

ProductSchema.index({ status: 1, category: 1, price: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });

const transform = (_: any, ret: any) => ({
    id: ret.id,
    isSeller: ret.idSeller,
    title: ret.title,
    description: ret.description,
    price: ret.price,
    category: ret.category,
    condition: ret.condition,
    brand: ret.brand,
    size: ret.size,
    images: ret.images,
    status: ret.status,
    createdAt: ret.createdAt
});

ProductSchema.set('toJSON', { virtuals: true, transform });
ProductSchema.set('toObject', { virtuals: true, transform });

export const productModel = model<ProductDocument>('Product', ProductSchema);