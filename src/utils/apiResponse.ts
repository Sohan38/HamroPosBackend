export interface ApiError {
    code: string;
    message: string;
}

export interface ApiMeta {
    timestamp: string;
    apiVersion: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    errors: ApiError[];
    meta: ApiMeta;
}

const apiVersion = '1.0.0';

export const createResponse = <T>(data: T | null, errors: ApiError[] = []): ApiResponse<T> => ({
    success: errors.length === 0,
    data,
    errors,
    meta: {
        timestamp: new Date().toISOString(),
        apiVersion,
    },
});
