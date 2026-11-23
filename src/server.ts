import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import redis from "./config/redis.js";
import type { Server } from "node:http";
import { producer, consumer } from "./config/kafka.js";
let httpServer: Server | undefined;
import { ensureKafkaTopics } from "./config/kafka-topics.js";
const PORT = process.env.PORT || 3000;

async function shutdown(signal: string): Promise<void> {
    console.log(`${signal} received. Shutting down...`);

    if (httpServer) {
        const server = httpServer;
        httpServer = undefined;

        await new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
    }

    if (redis.status === "ready") {
        await redis.quit();
    } else {
        redis.disconnect();
    }

    await producer.disconnect();
    console.log("Kafka producer disconnected successfully");

    await consumer.disconnect();
    console.log("Kafka consumer disconnected successfully");

    await prisma.$disconnect();

    console.log("OrderFlow shut down successfully");

    process.exit(0);
}

let isShuttingDown = false;

function handleShutdown(signal: string): void {
    if (isShuttingDown) return;

    isShuttingDown = true;

    void shutdown(signal).catch((error) => {
        console.error("Shutdown failed:", error);
        process.exit(1);
    });
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
async function startServer(): Promise<void> {
    let producerConnected = false;
    let consumerConnected = false;

    try {
        // 1. Connect PostgreSQL
        await prisma.$connect();
        console.log("Database connected successfully");

        // 2. Connect Redis
        await redis.connect();
        console.log("Redis connected successfully");

        // 3. Initialize Kafka topics
        await ensureKafkaTopics();
        console.log("Kafka topics initialized successfully");

        // 4. Connect Kafka producer
        await producer.connect();
        producerConnected = true;
        console.log("Kafka producer connected successfully");

        // 5. Connect Kafka consumer
        await consumer.connect();
        consumerConnected = true;
        console.log("Kafka consumer connected successfully");

        // 6. Start HTTP server
        httpServer = app.listen(PORT, () => {
            console.log(`OrderFlow running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start application:", error);

        if (consumerConnected) {
            await consumer.disconnect().catch(() => {});
        }

        if (producerConnected) {
            await producer.disconnect().catch(() => {});
        }

        redis.disconnect();

        await prisma.$disconnect().catch(() => {});

        process.exit(1);
    }
}

startServer();
