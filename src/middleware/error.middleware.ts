import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";

export const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({
            success: false,
            error: {
                code: "EMAIL_ALREADY_EXISTS",
                message: "An account with this email already exists"
            }
        });
        return;
    }

    logger.error(
        {
            err: error,
            requestId: res.getHeader("X-Request-ID")
        },
        "Unhandled application error"
    );

    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong"
        }
    });
};
