import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import prisma from "../../config/prisma.js";
import { RegisterInput } from "./auth.schema.js";

export const registerUser = async (input: RegisterInput) => {

    const hashedPassword = await bcrypt.hash(input.password, 12);

    try {
        const user = await prisma.user.create({
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

    } catch (error) {

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        throw error;
    }
};