import { Request, Response, NextFunction } from "express";

export class paymentError extends Error {
    constructor() {
        super();
        this.name = 'Payment error';
        this.message = 'there is a paymenr error';
    }
}

export const paymentHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof paymentError) {
        res.status(502);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}