import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().min(1),
  MONGO_DB_NAME: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const getEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issueText = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issueText}`);
  }

  return parsed.data;
};
