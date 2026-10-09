import { z } from "zod";

export const QRMatricesSchema = z.object({
  q: z.array(z.array(z.number())).min(1),
  r: z.array(z.array(z.number())).min(1)
});

export type QRMatricesInput = z.infer<typeof QRMatricesSchema>;
