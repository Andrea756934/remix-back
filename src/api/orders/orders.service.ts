import { paypal } from "../../utils/paypal/paypal";
import { orderModel } from "./orders.model";
import { order, orderList } from "./orders.entity";
import { createOrderDTO, ListOrdersDTO, shipOrdersDTO } from "./orders.dto";
import { productModel } from "../prodotti/prodotti.model";
import { NotFoundError } from "../../errors/not-found.error";
import { ProductNotAvailableError } from "../../errors/product-not-available.error";
import { invalidOrderStateError } from "../../errors/invalid-order-state.error";
import { selfPurchaseError } from "../../errors/self-purchase.error";
import { paymentError } from "../../errors/payment.error";

export class orderService {
    async find(userId: string, filters: ListOrdersDTO): Promise<orderList> {
        const { role, status } = filters;
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;

        const mine = role === 'buyer' ? { buyer: userId }
            : role === 'seller' ? { seller: userId }
                : { $or: [{ buyer: userId }, { seller: userId }] };

        const filter = { ...mine, ...(status && { status }) };

        const [orders, total] = await Promise.all([
            orderModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate(['buyer', 'seller']),
            orderModel.countDocuments(filter)
        ]);

        return {
            items: orders.map(order => this.orderResponse(order)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findById(orderId: string, userId: string): Promise<order> {
        const order = await this.ownOrder(orderId, { $or: [{ buyer: userId }, { seller: userId }] });
        await order.populate(['buyer', 'seller']);

        return this.orderResponse(order);
    }

    async add(data: createOrderDTO, buyerId: string): Promise<order> {
        const product = await productModel.findById(data.productId);

        if (!product || product.status !== 'active') {
            throw new ProductNotAvailableError();
        }

        if (product.idSeller.toString() === buyerId) {
            throw new selfPurchaseError();
        }

        //se il compratore ha già un ordine in sospeso per questo prodotto, lo riuso aggiornando l'indirizzo
        const pending = await orderModel.findOne({ product: product._id, buyer: buyerId, status: 'pending' });

        if (pending) {
            pending.shippingAddress = data.shippingAddress as any;
            await pending.save();
            await pending.populate(['buyer', 'seller']);
            return this.orderResponse(pending);
        }

        const price = Math.round(product.price * 100);

        const order = await orderModel.create({
            product: product._id,
            productSnapshot: {
                title: product.title,
                image: product.images[0],
                price
            },
            buyer: buyerId,
            seller: product.idSeller,
            amount: price,
            shippingAddress: data.shippingAddress
        });

        await order.populate(['buyer', 'seller']);
        return this.orderResponse(order);
    }

    async checkout(orderId: string, buyerId: string): Promise<{ url: string }> {
        const order = await this.ownOrder(orderId, { buyer: buyerId, status: 'pending' });

        //il prodotto deve essere ancora in vendita
        const product = await productModel.findOne({ _id: order.product, status: 'active' });

        if (!product) {
            throw new ProductNotAvailableError();
        }

        const paypalOrder = await paypal.createOrder(
            order.id, order.amount, order.currency, order.productSnapshot.title
        );

        const link = paypalOrder.links.find((l: any) => l.rel === 'payer-action' || l.rel === 'approve');

        if (!link) {
            throw new paymentError();
        }

        order.paymentId = paypalOrder.id;
        await order.save();

        return { url: link.ref };
    }

    async capture(orderId: string, buyerId: string): Promise<order> {
        const order = await this.ownOrder(orderId, { buyer: buyerId, status: 'pending' });

        if (!order.paymentId) {
            throw new invalidOrderStateError();
        }

        //se il compratore non ha approvato, Paypal risponde con errore
        const result = await paypal.captureOrder(order.paymentId);

        if (result.status !== 'COMPLETED') {
            throw new paymentError();
        }

        const captureId = result.purchase_units[0].payments.capture[0].id;

        //1) l'ordine passa a paid in modo atomico: se una richiesta parallela l'ha già fatto, non si procede
        const paid = await orderModel.findOneAndUpdate(
            { _id: order._id, status: 'pending' },
            { status: 'paid', paidAt: new Date(), captureId },
            { new: true }
        );
        if (!paid) {
            return this.findById(orderId, buyerId);
        }

        //2) il prodotto passa a sold in modo atomico: solo il primo pagamento vince
        const sold = await productModel.updateOne({ _id: order.product, status: 'active' }, { status: 'sold' });

        if (sold.modifiedCount === 0) {
            await paypal.refundCapture(captureId);
            paid.status = 'cancelled';
            await paid.save();
            throw new ProductNotAvailableError();
        }

        await paid.populate(['buyer', 'seller']);
        return this.orderResponse(paid);
    }

    async ship(orderId: string, data: shipOrdersDTO, sellerId: string): Promise<order> {
        const order = await this.ownOrder(orderId, { seller: sellerId, status: 'paid' });

        order.status = 'shipped';
        order.trackingCode = data.trackingCode;
        order.carrier = data.carrier;
        order.shippedAt = new Date();
        await order.save();

        await order.populate(['buyer', 'seller']);
        return this.orderResponse(order);
    }

    async confirmDelivery(orderId: string, buyerId: string): Promise<order> {
        const order = await this.ownOrder(orderId, { buyer: buyerId, status: 'shipped' });

        order.status = 'delivered';
        order.deliveredAt = new Date();
        await order.save();

        await order.populate(['buyer', 'seller']);
        return this.orderResponse(order);
    }

    async cancel(orderId: string, buyerId: string): Promise<order> {
        const order = await this.ownOrder(orderId, { buyer: buyerId, status: 'pending' });

        order.status = 'cancelled';
        await order.save();

        await order.populate(['buyer', 'seller']);
        return this.orderResponse(order);
    }

    private async ownOrder(orderId: string, filter: Record<string, any>) {
        if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
            throw new NotFoundError();
        }

        const order = await orderModel.findOne({ _id: orderId, ...filter });

        if (!order) {
            throw new NotFoundError();
        }

        //distinguo "non è tuo / non esiste" (404) da "stato sbagliato" (400)
        const { status, ...withoutStatus } = filter;

        if (status && await orderModel.exists({ _id: orderId, ...withoutStatus })) {
            throw new invalidOrderStateError();
        }

        return order;
    }

    private orderResponse(order: any): order {
        return order.toObject() as order;
    }
}

export default new orderService();