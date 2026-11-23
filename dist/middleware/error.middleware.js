"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_js_1 = __importDefault(require("../config/logger.js"));
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
    logger_js_1.default.error({
        err: error,
        requestId: res.getHeader("X-Request-ID")
    }, "Unhandled application error");
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