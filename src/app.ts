import express from "express";
import prisma from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);
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
        console.error("Database health check failed:", error);

        res.status(503).json({
            status: "DOWN",
            database: "disconnected"
        });
    }
});

export default app;
