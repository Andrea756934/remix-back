import { Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import orderService from "./orders.service";
import { ListOrdersDTO } from "./orders.dto";
import { user } from "../user/user.entity";

export const list = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await orderService.find((req.user! as user).id, req.query as ListOrdersDTO);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const OrderId = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.findById(id, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const create = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await orderService.add(req.body, (req.user! as user).id);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const checkout = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.checkout(id, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const capture = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.capture(id, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const ship = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.ship(id, req.body, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const confirmDelivery = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.confirmDelivery(id, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const cancel = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await orderService.cancel(id, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}