import { z } from "zod";

export const gradleTestInputSchema = z.object({
  projectPath: z.string().min(1, "projectPath is required"),
  packageName: z.string().min(1).optional(),
  className: z.string().min(1).optional(),
  methodName: z.string().min(1).optional(),
  testPattern: z.string().min(1).optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export type GradleTestInputDto = z.infer<typeof gradleTestInputSchema>;
