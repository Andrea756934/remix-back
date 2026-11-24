import { Request, Response, NextFunction } from "express";

export class ProductNotAvailableError extends Error {
    constructor() {
        super();
        this.name = 'product not available';
        this.message = 'this product is not available';
    }
};

export const ProductNotAvailableHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ProductNotAvailableError) {
        res.status(409);
        res.json({
            error: err.name,
            message: err.message
        });
    } else {
        next(err);
    }
}