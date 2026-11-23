"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
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
    console.error("Unhandled application error:", error);
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong"
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map