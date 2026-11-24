import { order } from "../orders/orders.entity";
import { user } from "../user/user.entity";

export type reviewTarget = 'user' | 'product';

export type review = {
    id: string,
    order: string | order,
    author: string | user,
    targetType: reviewTarget;
    target: string,
    rating: number,
    comment?: string,
    createdAt?: Date
}

export type reviewList = {
    items: review[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    averageRating: number,
    ratingsCount: number
}
