import { Request, Response, NextFunction } from "express";

export class ActiveOrdersError extends Error {
    constructor() {
        super();
        this.name = 'Active orders error';
        this.message = 'you have orders in progress';
    }
}

export const ActiveOrdersHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ActiveOrdersError) {
        res.status(409);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}