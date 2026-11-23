import { Kafka, logLevel } from "kafkajs";

const brokers = process.env.KAFKA_BROKERS?.split(",");

if (!brokers || brokers.length === 0 || !brokers[0]) {
    throw new Error("KAFKA_BROKERS is not configured");
}

const kafka = new Kafka({
    clientId: "orderflow-api",
    brokers,
    logLevel: logLevel.ERROR,
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

export const producer = kafka.producer();

export const consumer = kafka.consumer({
    groupId: "orderflow-consumers"
});

export default kafka;
