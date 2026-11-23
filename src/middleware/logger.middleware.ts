import { randomUUID } from "node:crypto";
import pinoHttp from "pino-http";
import logger from "../config/logger.js";

const httpLogger = pinoHttp({
    logger,

    genReqId(req, res) {
        const incomingId = req.headers["x-request-id"];

        const requestId =
            typeof incomingId === "string" &&
            /^[a-zA-Z0-9._-]{1,128}$/.test(incomingId)
                ? incomingId
                : randomUUID();

        res.setHeader("X-Request-ID", requestId);

        return requestId;
    }
});

export default httpLogger;
