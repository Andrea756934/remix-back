import { Request, Response, NextFunction } from "express";

export class reviewNotAllowedError extends Error {
    constructor() {
        super();
        this.name = 'review not allowed';
        this.message = 'you cannot review this';
    }
}

export const reviewNotAllowedHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof reviewNotAllowedError) {
        res.status(403);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}