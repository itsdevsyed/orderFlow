import express from "express";
import prisma from "./config/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import httpLogger from "./middleware/logger.middleware.js";
import logger from "./config/logger.js";
import redis from "./config/redis.js";
import metricsMiddleware from "./middleware/metrics.middleware.js";
import { register } from "./config/metrics.js";
const app = express();

// Global middleware
app.use(httpLogger);
app.use(metricsMiddleware);
app.use(express.json());

// API routes
app.use("/api/v1/auth", authRoutes);





// Health check
app.get("/health", (req, res) => {
res.status(200).json({
status: "UP",
service: "orderflow"
});
});
app.get("/health/database", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "UP",
            database: "connected"
        });
    } catch (error) {
        logger.error(
            { err: error },
            "Database health check failed"
        );

        res.status(503).json({
            status: "DOWN",
            database: "disconnected"
        });
    }
});
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

app.get("/health/live", (req, res) => {
    res.status(200).json({
        status: "UP"
    });
});

// Readiness check
app.get("/health/ready", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        await redis.ping();

        res.status(200).json({
            status: "UP",
            dependencies: {
                database: "connected",
                redis: "connected"
            }
        });
    } catch (error) {
        logger.error(
            { err: error },
            "Readiness check failed"
        );

        res.status(503).json({
            status: "DOWN"
        });
    }
});

// Centralized error handler MUST be last
app.use(errorHandler);

export default app;
