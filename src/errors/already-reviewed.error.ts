import { Request, Response, NextFunction } from "express";

export class alreadyReviewedError extends Error {
    constructor() {
        super();
        this.name = 'Already reviewed error';
        this.message = "you can't write more than one review";
    }
}

export const alreadyReviewedHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof alreadyReviewedError) {
        res.status(409);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}