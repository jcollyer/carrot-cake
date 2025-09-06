import prisma from "@/lib/prisma" 
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

type SessionProps = {
  session: any;
  token: any;
  user: any;
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "database" as const,
  },
  callbacks: {
    async session({ session, user }: SessionProps) {
      // Include the user ID in the session object
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
};

export default NextAuth(authOptions);
