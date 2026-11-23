"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log("Database connected successfully");
        app_1.default.listen(PORT, () => {
            console.log(`OrderFlow running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map