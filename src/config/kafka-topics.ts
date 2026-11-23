import kafka from "./kafka.js";

const admin = kafka.admin();

export async function ensureKafkaTopics(): Promise<void> {
    await admin.connect();

    try {
        const existingTopics = await admin.listTopics();

        if (existingTopics.includes("order-events")) {
            console.log("Kafka topic order-events already exists");
            return;
        }

        await admin.createTopics({
            waitForLeaders: true,
            topics: [
                {
                    topic: "order-events",
                    numPartitions: 3,
                    replicationFactor: 1
                }
            ]
        });

        console.log("Kafka topic order-events created successfully");
    } finally {
        await admin.disconnect();
    }
}
