import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.4"),
  OPENAI_MAX_OUTPUT_TOKENS: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return 1200;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 1200;
    })
});

type EnvSchema = z.infer<typeof envSchema>;

let cachedEnv: EnvSchema | null = null;

export function getEnv(): EnvSchema {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
