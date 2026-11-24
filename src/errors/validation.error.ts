import { ValidationError as OriginalValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export class validationError extends Error {
    originalErrors: OriginalValidationError[];

    constructor(error: OriginalValidationError[]) {
        super();
        this.name = 'validationError';
        this.message = error.map(error => {
            return Object.values(error.constraints!).join(', ');
        }).join(', ');
        this.originalErrors = error;
    }
}

export const validationHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof validationError) {
        res.status(400);
        res.json({
            error: err.name,
            message: err.message,
            details: err.originalErrors.map(err => ({
                property: err.property,
                value: err.value,
                constraints: err.constraints
            }))
        });
    } else {
        next(err);
    }
}