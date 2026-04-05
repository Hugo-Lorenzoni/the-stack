import { z } from "zod";

const EnvSchema = z.object({
  DATA_FOLDER: z.string().default("data"),
  POSTHOG_PROJECT_TOKEN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_PROJECT_ID: z.string().optional(),
  POSTHOG_OTLP_LOGS_URL: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  MYSQL_ROOT_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_HOST: z.string().default("localhost"),
  MYSQL_PORT: z.string().default("3306"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  EMAIL: z.string().email(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

EnvSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
