"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma_js_1 = __importDefault(require("../../config/prisma.js"));
const registerUser = async (input) => {
    const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
    try {
        const user = await prisma_js_1.default.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                firstName: input.firstName,
                lastName: input.lastName
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true
            }
        });
        return user;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }
        throw error;
    }
};
exports.registerUser = registerUser;
//# sourceMappingURL=auth.service.js.map