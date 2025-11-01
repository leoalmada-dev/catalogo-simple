import { z } from "zod";

// status de productos según enum catalogo_product_status
export const productStatus = z.enum(["draft","published","archived"]);

export const variantSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  name: z.string().optional().nullable(),
  price: z.number().min(0).default(0),       // decimal en UI → se convertirá a cents en server
  is_available: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
  // `z.record` en algunas versiones/definiciones de Zod espera (keySchema, valueSchema).
  // Usamos key string y value unknown para ser conservadores y compatibles.
  attributes: z.record(z.string(), z.unknown()).optional().nullable(), // libre
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  status: productStatus.default("draft"),
  variants: z.array(variantSchema).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
