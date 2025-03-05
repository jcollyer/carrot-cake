import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
// import EmailProvider from "next-auth/providers/email"
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/lib/prisma";

export const authOptions = {
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM
    // }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
}
export default NextAuth(authOptions)
