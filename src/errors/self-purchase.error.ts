import { Request, Response, NextFunction } from "express";

export class selfPurchaseError extends Error {
    constructor() {
        super();
        this.name = 'self purchase error';
        this.message = 'you cannot buy your own product';
    }
}

export const selfPurchaseHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof selfPurchaseError) {
        res.status(400);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}