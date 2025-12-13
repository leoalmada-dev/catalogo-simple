// lib/validation/auth.ts
import { z } from "zod";

export const emailSchema = z
    .string()
    .trim()
    .min(1, "Ingresá tu email.")
    .email("Ingresá un email válido.");

export const resetRequestSchema = z.object({
    email: emailSchema,
});

export const passwordSchema = z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres.")
    .max(72, "La contraseña es demasiado larga."); // límite práctico (bcrypt/otros)

export const resetConfirmSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Las contraseñas no coinciden.",
            });
        }
    });
