import { Request, Response, NextFunction } from "express";

export class selfConversationError extends Error {
    constructor() {
        super();
        this.name = 'selfConversationError';
        this.message = 'you cannot message yourself';
    }
}

export const selfConversationHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof selfConversationError) {
        res.status(400);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}