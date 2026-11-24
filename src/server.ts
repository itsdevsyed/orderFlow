import "dotenv/config";

import type { Server } from "node:http";

import app from "./app.js";
import prisma from "./config/prisma.js";
import redis from "./config/redis.js";
import logger from "./config/logger.js";
import { producer, consumer } from "./config/kafka.js";
import { ensureKafkaTopics } from "./config/kafka-topics.js";

const PORT = Number(process.env.PORT || 3000);

let httpServer: Server | undefined;

let prismaConnected = false;
let redisConnected = false;
let producerConnected = false;
let consumerConnected = false;

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, "Shutdown signal received");

    if (httpServer) {
        const server = httpServer;
        httpServer = undefined;

        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        logger.info("HTTP server closed successfully");
    }

    const cleanupTasks: Promise<unknown>[] = [];

    if (consumerConnected) {
        cleanupTasks.push(consumer.disconnect());
        consumerConnected = false;
    }

    if (producerConnected) {
        cleanupTasks.push(producer.disconnect());
        producerConnected = false;
    }

    if (redisConnected) {
        cleanupTasks.push(redis.quit());
        redisConnected = false;
    }

    if (prismaConnected) {
        cleanupTasks.push(prisma.$disconnect());
        prismaConnected = false;
    }

    const results = await Promise.allSettled(cleanupTasks);

    results.forEach((result) => {
        if (result.status === "rejected") {
            logger.error(
                { err: result.reason },
                "Resource cleanup failed"
            );
        }
    });

    logger.info("OrderFlow shut down successfully");

    process.exit(0);
}

function handleShutdown(signal: string): void {
    if (isShuttingDown) return;

    isShuttingDown = true;

    void shutdown(signal).catch((error) => {
        logger.fatal({ err: error }, "Shutdown failed");
        process.exit(1);
    });
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

async function startServer(): Promise<void> {
    try {
        // 1. Connect PostgreSQL
        await prisma.$connect();
        prismaConnected = true;

        logger.info("Database connected successfully");

        // 2. Connect Redis
        await redis.connect();
        redisConnected = true;

        logger.info("Redis connected successfully");

        // 3. Initialize Kafka topics
        await ensureKafkaTopics();

        logger.info("Kafka topics initialized successfully");

        // 4. Connect Kafka producer
        await producer.connect();
        producerConnected = true;

        logger.info("Kafka producer connected successfully");

        // 5. Connect Kafka consumer
        await consumer.connect();
        consumerConnected = true;

        logger.info("Kafka consumer connected successfully");

        // 6. Start HTTP server
        httpServer = app.listen(PORT, () => {
            logger.info(
                { port: PORT },
                "OrderFlow running"
            );
        });

    } catch (error) {
        logger.fatal(
            { err: error },
            "Failed to start application"
        );

        const cleanupTasks: Promise<unknown>[] = [];

        if (consumerConnected) {
            cleanupTasks.push(consumer.disconnect());
        }

        if (producerConnected) {
            cleanupTasks.push(producer.disconnect());
        }

        if (redisConnected) {
            cleanupTasks.push(redis.quit());
        } else {
            redis.disconnect();
        }

        if (prismaConnected) {
            cleanupTasks.push(prisma.$disconnect());
        }

        await Promise.allSettled(cleanupTasks);

        process.exit(1);
    }
}

startServer();  
