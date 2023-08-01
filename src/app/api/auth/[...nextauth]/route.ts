import { OPTIONS } from "@/utils/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(OPTIONS);

export { handler as GET, handler as POST };
