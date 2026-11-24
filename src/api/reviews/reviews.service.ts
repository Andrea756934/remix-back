import { Types } from "mongoose";
import { reviewModel } from "./reviews.model";
import { review, reviewList, reviewTarget } from "./reviews.entity";
import { createReviewDTO, ListReviewsDTO } from "./reviews.dto";
import { orderModel } from "../orders/orders.model";
import { productModel } from "../prodotti/prodotti.model";
import { userModel } from "../user/user.model";
import { NotFoundError } from "../../errors/not-found.error";
import { reviewNotAllowedError } from "../../errors/review-not-allowed.error";
import { alreadyReviewedError } from "../../errors/already-reviewed.error";

export class reviewService {
    async findByUser(userId: string, filters: ListReviewsDTO): Promise<reviewList> {
        this.checkId(userId);

        const user = await userModel.exists({ _id: userId });

        if (!user) {
            throw new NotFoundError();
        }

        return this.list('user', userId, filters);
    }

    async findByProduct(productId: string, filters: ListReviewsDTO): Promise<reviewList> {
        this.checkId(productId);

        const product = await productModel.exists({ _id: productId });

        if (!product) {
            throw new NotFoundError();
        }

        return this.list('product', productId, filters);
    }

    async createUser(targetId: string, data: createReviewDTO, authorId: string): Promise<review> {
        this.checkId(targetId);

        const target = await userModel.exists({ _id: targetId });

        if (!target) {
            throw new NotFoundError();
        }

        if (targetId === authorId) {
            throw new reviewNotAllowedError();
        }

        //serve un ordine consegnato tra i due, in qualunque direzione
        const order = await orderModel.findOne({
            status: 'delivered',
            $or: [
                { buyer: authorId, seller: targetId },
                { buyer: targetId, seller: authorId }
            ]
        });

        if (!order) {
            throw new reviewNotAllowedError();
        }

        return this.save('user', targetId, order._id, data, authorId);
    }

    async createProduct(productId: string, data: createReviewDTO, authorId: string): Promise<review> {
        this.checkId(productId);

        const product = await productModel.exists({ _id: productId });

        if (!product) {
            throw new NotFoundError();
        }

        //solo il compratore di un ordine consegnato di quel prodotto
        const order = await orderModel.findOne({ product: productId, buyer: authorId });

        if (!order) {
            throw new reviewNotAllowedError();
        }

        return this.save('product', productId, order._id, data, authorId);
    }

    private async save(
        targetType: reviewTarget,
        target: string,
        order: Types.ObjectId,
        data: createReviewDTO,
        authorId: string): Promise<review> {
        try {
            const findReview = await reviewModel.exists({ author: authorId, targetType, target });

            if (findReview) {
                throw new alreadyReviewedError();
            }

            const review = await reviewModel.create({
                targetType,
                target,
                author: authorId,
                order,
                rating: data.rating,
                comment: data.comment || undefined
            });

            await review.populate(['author']);
            return this.reviewResponse(review);
        }
        catch (err: any) {
            //due richieste in parallelo: l'indice unico blocca la seconda
            if (err.code === 11000) {
                throw new alreadyReviewedError();
            }
            throw err;
        }
    }

    private async list(targetType: reviewTarget, target: string, filters: ListReviewsDTO): Promise<reviewList> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const filter = { targetType, target };

        const [reviews, total, stats] = await Promise.all([
            reviewModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author'),
            reviewModel.countDocuments(filter),
            reviewModel.aggregate([
                { $match: { targetType, target: new Types.ObjectId(target) } },
                { $group: { _id: null, average: { $avg: 'rating' } } }
            ])
        ]);

        return {
            items: reviews.map(review => this.reviewResponse(review)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            averageRating: stats.length ? Math.round(stats[0].average * 10) / 10 : 0,
            ratingsCount: total
        };
    }

    private checkId(id: string): void {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new NotFoundError();
        }
    }

    private reviewResponse(review: any): review {
        return review.toObject() as review;
    }
}

export default new reviewService();