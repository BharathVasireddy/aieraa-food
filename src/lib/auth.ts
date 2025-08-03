import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { university: true }
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        if (user.status === "REJECTED") {
          throw new Error("Your account has been rejected")
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Your account has been suspended")
        }

        if (user.status === "PENDING" && user.role === "STUDENT") {
          throw new Error("Your account is pending approval from your university manager")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          universityId: user.universityId || undefined,
          university: user.university?.name || undefined,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.universityId = user.universityId
        token.university = user.university
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub as string
      session.user.role = token.role as UserRole
      session.user.status = token.status as string
      session.user.universityId = token.universityId as string
      session.user.university = token.university as string
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}