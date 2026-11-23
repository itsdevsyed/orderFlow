"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const prisma_js_1 = __importDefault(require("./config/prisma.js"));
const redis_js_1 = __importDefault(require("./config/redis.js"));
const logger_js_1 = __importDefault(require("./config/logger.js"));
const kafka_js_1 = require("./config/kafka.js");
let httpServer;
const kafka_topics_js_1 = require("./config/kafka-topics.js");
const PORT = process.env.PORT || 3000;
async function shutdown(signal) {
    console.log(`${signal} received. Shutting down...`);
    if (httpServer) {
        const server = httpServer;
        httpServer = undefined;
        await new Promise((resolve) => {
            server.close(() => resolve());
        });
    }
    if (redis_js_1.default.status === "ready") {
        await redis_js_1.default.quit();
    }
    else {
        redis_js_1.default.disconnect();
    }
    await kafka_js_1.producer.disconnect();
    console.log("Kafka producer disconnected successfully");
    await kafka_js_1.consumer.disconnect();
    console.log("Kafka consumer disconnected successfully");
    await prisma_js_1.default.$disconnect();
    console.log("OrderFlow shut down successfully");
    process.exit(0);
}
let isShuttingDown = false;
function handleShutdown(signal) {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    void shutdown(signal).catch((error) => {
        console.error("Shutdown failed:", error);
        process.exit(1);
    });
}
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
async function startServer() {
    let producerConnected = false;
    let consumerConnected = false;
    try {
        // 1. Connect PostgreSQL
        await prisma_js_1.default.$connect();
        logger_js_1.default.info("Database connected successfully");
        // 2. Connect Redis
        await redis_js_1.default.connect();
        logger_js_1.default.info("Redis connected successfully");
        // 3. Initialize Kafka topics
        await (0, kafka_topics_js_1.ensureKafkaTopics)();
        logger_js_1.default.info("Kafka topics initialized successfully");
        // 4. Connect Kafka producer
        await kafka_js_1.producer.connect();
        producerConnected = true;
        logger_js_1.default.info("Kafka producer connected successfully");
        // 5. Connect Kafka consumer
        await kafka_js_1.consumer.connect();
        consumerConnected = true;
        logger_js_1.default.info("Kafka consumer connected successfully");
        // 6. Start HTTP server
        httpServer = app_js_1.default.listen(PORT, () => {
            logger_js_1.default.info(`OrderFlow running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_js_1.default.error({ err: error }, "Failed to start application");
        if (consumerConnected) {
            await kafka_js_1.consumer.disconnect().catch(() => { });
        }
        if (producerConnected) {
            await kafka_js_1.producer.disconnect().catch(() => { });
        }
        redis_js_1.default.disconnect();
        await prisma_js_1.default.$disconnect().catch(() => { });
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map