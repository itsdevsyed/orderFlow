import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    base: {
        service: "orderflow-api",
        environment: process.env.NODE_ENV || "development"
    },

    redact: {
        paths: [
            "password",
            "*.password",
            "req.headers.authorization",
            "req.headers.cookie"
        ],
        censor: "[REDACTED]"
    },

    timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;
