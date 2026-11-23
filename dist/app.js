"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("./config/prisma"));
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const logger_middleware_js_1 = __importDefault(require("./middleware/logger.middleware.js"));
const app = (0, express_1.default)();
app.use(logger_middleware_js_1.default);
app.use(express_1.default.json());
app.use("/api/v1/auth", auth_routes_js_1.default);
app.use(error_middleware_js_1.errorHandler);
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "orderflow"
    });
});
app.get("/health/database", async (req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: "UP",
            database: "connected"
        });
    }
    catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({
            status: "DOWN",
            database: "disconnected"
        });
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map