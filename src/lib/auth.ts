import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import * as bcrypt from "bcrypt";
import { env } from "process";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  user: {
    additionalFields: {
      surname: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      cercle: {
        type: "string",
        required: false,
      },
      cercleVille: {
        type: "string",
        required: false,
      },
      autreCercle: {
        type: "string",
        required: false,
      },
      promo: {
        type: "number",
        required: false,
      },
    },
  },
});
