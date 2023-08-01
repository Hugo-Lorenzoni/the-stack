import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "process";
import { Session, SessionStrategy, User, getServerSession } from "next-auth";
import { JWT } from "next-auth/jwt";

export const OPTIONS = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials?.email,
            password: credentials?.password,
          }),
        });
        const user = await res.json();

        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      /* Step 1: update the token based on the user object */
      if (user) {
        token.surname = user.surname;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      /* Step 2: update the session.user based on the token object */
      if (token && session.user) {
        session.user.surname = token.surname;
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: env.NEXTAUT_SECRET,
  pages: {
    signIn: "/connexion",
  },
};

export async function getNextAuthSession() {
  const session = await getServerSession(OPTIONS);
  return session;
}
