import { user } from "../user/user.entity";

export type orderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type shippingAddress = {
    fullName: string,
    street: string,
    city: string,
    country: string,
    phone?: string
}

//copia del prodotto al momento dell'ordine

export type ProductSnapshot = {
    title: string,
    image: string,
    price: number
}

export type order = {
    id: string,
    productId: string,
    productSnapshot: ProductSnapshot,
    buyer: string | user,
    seller: string | user,
    amount: number,
    currency: string,
    status: orderStatus,
    shippingAddress: shippingAddress,
    trackingCode?: string,
    carrier?: string,
    paymentId?: string,
    captureId?: string,
    paidAt?: Date,
    shippedAt?: Date,
    deliveredAt?: Date,
    createdAt?: Date
}

export type orderList = {
    items: order[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
}