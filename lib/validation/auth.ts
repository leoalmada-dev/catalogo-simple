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

// (para Bloque 2 lo extendemos con password/confirm)
