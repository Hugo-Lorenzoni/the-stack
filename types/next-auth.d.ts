import { Role } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    surname: string;
    id: string;
    email: string;
    role?: Role;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    surname: string;
    id: string;
    email: string;
    role?: Role;
  }
}
