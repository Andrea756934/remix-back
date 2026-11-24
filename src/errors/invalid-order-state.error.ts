import { Request, Response, NextFunction } from "express";

export class invalidOrderStateError extends Error {
    constructor() {
        super();
        this.name = 'Invalid order state';
        this.name = 'Operation not allowed for the current order status';
    }
}

export const invalidOrderStateHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof invalidOrderStateError) {
        res.status(400);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}