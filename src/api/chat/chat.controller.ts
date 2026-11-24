import { Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import chatService from "./chat.service";
import { user } from "../user/user.entity";

export const list = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await chatService.find((req.user! as user).id);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const messageId = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const page = req.query.page ? Number(req.body.page) : undefined;
        const limit = req.query.limit ? Number(req.body.limit) : undefined;

        let results = await chatService.getMessage(id, (req.user as user).id, page, limit);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const create = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await chatService.add(req.body.productId, (req.user! as user).id);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const createMessage = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await chatService.send(id, (req.user! as user).id, req.body.text);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}