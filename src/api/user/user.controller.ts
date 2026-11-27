import { Request, Response, NextFunction } from "express";
import { TypedRequest } from "../../utils/typed-request.interface";
import userService from "./user.service";
import { user } from "./user.entity";

export const me = async (req: Request, res: Response, next: NextFunction) => {
    res.json(req.user);
}

export const userId = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.params.id as string
        let results = await userService.findById(user)

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const getProfile = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const id = (req.user as user).id;
        let results = await userService.findById(id);

        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const list = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await userService.find();
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const update = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await userService.updateProfile((req.user! as user).id, req.body);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}

export const remove = async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        let results = await userService.deleteAccount((req.user! as user).id, req.body);
        res.json(results);
    }
    catch (err) {
        next(err);
    }
}