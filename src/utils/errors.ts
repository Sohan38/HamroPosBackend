export class ApiError extends Error {
    public readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export class ValidationError extends ApiError {
    constructor(message: string) {
        super('VALIDATION_ERROR', message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super('NOT_FOUND', message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super('FORBIDDEN', message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super('CONFLICT', message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
