import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(254, "Email is too long")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(12, "Password must contain at least 12 characters")
        .max(72, "Password cannot exceed 72 bytes")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[0-9]/, "Password must contain a number"),

    firstName: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .regex(/^[\p{L}\p{M}' -]+$/u, "Invalid first name"),

    lastName: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .regex(/^[\p{L}\p{M}' -]+$/u, "Invalid last name")
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;