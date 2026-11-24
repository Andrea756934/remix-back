import { Router } from "express";
import authRouter from './auth/auth.router';
import userRouter from './user/user.router';
import productRouter from './prodotti/prodotti.router';
import chatRouter from './chat/chat.router';
import orderRouter from './orders/orders.router';
import reviewRouter from './reviews/reviews.router';

const router = Router();

router.use('/product', productRouter);
router.use('/chat', chatRouter);
router.use('/order', orderRouter);
router.use('/user', userRouter);
router.use('/:id/review', reviewRouter);
router.use(authRouter);

export default router;