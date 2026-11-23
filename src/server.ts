import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await prisma.$connect();

        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`OrderFlow running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

startServer();