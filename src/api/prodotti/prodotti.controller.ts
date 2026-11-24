import { Request, Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import productService from "./prodotti.service";
import { addProductDTO, updateProductDTO, ListProductDTO, ListMineDTO } from "./prodotti.dto";
import { user } from "../user/user.entity";

export const list = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await productService.find(req.query as ListProductDTO);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const productId = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await productService.findById(id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const create = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await productService.add(req.body, (req.user as user).id);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const update = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await productService.update(id, req.body, (req.user as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const remove = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await productService.remove(id, (req.user as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const signImage = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await productService.signImage((req.user! as user).id);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const mine = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await productService.findMine((req.user! as user).id, req.query as ListMineDTO);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const seller = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await productService.findBySeller(id, req.query as ListProductDTO);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const status = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        let results = await productService.changeStatus(id, req.body, (req.user! as user).id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const category = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await productService.category();
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}