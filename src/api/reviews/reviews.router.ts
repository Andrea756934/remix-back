import { Router } from "express";
import { listUser, listProduct, addUser, addProduct } from "./reviews.controller";
import { validate } from "../../utils/validation-middleware";
import { isAuthenticated } from "../../utils/auth/authenticated-middleware";
import { createReviewDTO, ListReviewsDTO } from "./reviews.dto";

const router = Router();

router.get('/user', isAuthenticated, validate(ListReviewsDTO, 'query'), listUser);
router.get('/product', isAuthenticated, validate(ListReviewsDTO, 'query'), listProduct);
router.post('/user', isAuthenticated, validate(createReviewDTO, 'body'), addUser);
router.post('/product', isAuthenticated, validate(createReviewDTO, 'body'), addProduct);

export default router;