import Redis from "ioredis";
import logger from "./logger.js";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
}

const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,

    retryStrategy(times) {
        return Math.min(times * 500, 5000);
    }
});

redis.on("connect", () => {
    logger.info("Redis connection established");
});

redis.on("ready", () => {
    logger.info("Redis is ready to accept commands");
});

redis.on("error", (error) => {
    logger.error({ err: error }, "Redis connection error");
});

redis.on("close", () => {
    logger.warn("Redis connection closed");
});

export default redis;
