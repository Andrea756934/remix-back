import { Request, Response, NextFunction } from "express";

export class InvalidPasswordError extends Error {
    constructor() {
        super();
        this.name = 'Invalid password error';
        this.message = 'invalid Password';
    }
}

export const InvalidPasswordHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof InvalidPasswordError) {
        res.status(403);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}