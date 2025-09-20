import { z } from "zod"

export const Invoice = z.object({
  number: z.string(),
  customer: z.object({ name: z.string(), email: z.string().optional() }),
  issueDate: z.string(), // ISO
  dueDate: z.string(),
  currency: z.string().default("USD"),
  total: z.number(),
  status: z.enum(["open", "paid", "overdue"]).default("open"),
})
export type Invoice = z.infer<typeof Invoice>

export const Tx = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
  ref: z.string().optional(),
  source: z.enum(["bank", "stripe", "mp"]),
})
export type Tx = z.infer<typeof Tx>
