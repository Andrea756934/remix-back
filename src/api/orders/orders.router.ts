import { Router } from "express";
import {
    list,
    OrderId,
    create,
    checkout,
    capture,
    ship,
    confirmDelivery,
    cancel
} from "./orders.controller";
import { isAuthenticated } from "../../utils/auth/authenticated-middleware";
import { validate } from "../../utils/validation-middleware";
import { createOrderDTO, ListOrdersDTO, shipOrdersDTO } from "./orders.dto";

const router = Router();

router.get('/', isAuthenticated, validate(ListOrdersDTO, 'query'), list);
router.get('/:id', isAuthenticated, OrderId);
router.post('/', isAuthenticated, validate(createOrderDTO, 'body'), create);
router.post('/:id/checkout', isAuthenticated, checkout);
router.post('/:id/capture', isAuthenticated, capture);
router.put('/:id', isAuthenticated, validate(shipOrdersDTO, 'body'), ship);
router.post('/:id/confirm_delivery', isAuthenticated, confirmDelivery);
router.post('/:id/cancel', isAuthenticated, cancel);

export default router;