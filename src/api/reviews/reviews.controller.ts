import { Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import reviewsService from "./reviews.service";
import { ListReviewsDTO } from "./reviews.dto";
import { user } from "../user/user.entity";

export const listUser = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await reviewsService.findByUser(id, req.query as ListReviewsDTO);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const listProduct = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await reviewsService.findByProduct(id, req.query as ListReviewsDTO);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const addUser = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await reviewsService.createUser(id, req.body, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const addProduct = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await reviewsService.createProduct(id, req.body, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}