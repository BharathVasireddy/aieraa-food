import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

// Define types locally to avoid Prisma import issues
type UserRole = 'ADMIN' | 'MANAGER' | 'STUDENT';
type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_URL environment variable is required in production');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Starting authentication for:', credentials?.email);
        const startTime = Date.now();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email (optimized query)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: {
              university: {
                select: {
                  name: true,
                },
              },
            },
          });
          console.log(`📊 Database query took: ${Date.now() - startTime}ms`);

          if (!user) {
            console.log('❌ User not found');
            throw new Error('Invalid email or password');
          }

          console.log('✅ User found, verifying password...');
          const bcryptStart = Date.now();
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log(`🔒 Password verification took: ${Date.now() - bcryptStart}ms`);

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Check if user is approved (for students)
          if (user.status === 'PENDING') {
            throw new Error('Your account is pending approval from your university manager');
          }

          if (user.status === 'REJECTED') {
            throw new Error('Your account has been rejected. Please contact your university manager');
          }

          // Return user data for NextAuth session
          console.log(`🎉 Authentication successful! Total time: ${Date.now() - startTime}ms`);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            universityId: user.universityId,
            university: user.university?.name,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Debug logging for production issues
      if (process.env.NODE_ENV === 'production') {
        console.log('🔐 JWT callback - User:', !!user, 'Token sub:', token.sub);
      }
      
      if (user) {
        token.role = user.role;
        token.status = user.status;
        token.universityId = user.universityId;
        token.university = user.university;
      }
      return token;
    },
    async session({ session, token }) {
      // Debug logging for production issues
      if (process.env.NODE_ENV === 'production') {
        console.log('🔐 Session callback - Token sub:', token.sub, 'Token role:', token.role);
      }
      
      if (!token.sub) {
        console.error('❌ No token.sub found in session callback');
        throw new Error('Invalid session token');
      }
      
      session.user.id = token.sub as string;
      session.user.role = token.role as UserRole;
      session.user.status = token.status as string;
      session.user.universityId = token.universityId as string;
      session.user.university = token.university as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Add better error handling for production
  events: {
    async signIn({ user, account }) {
      console.log('✅ Sign in event:', { user: user.email, account: account?.provider });
    },
    async signOut({ session }) {
      console.log('👋 Sign out event:', { user: session?.user?.email });
    },
    async session({ session }) {
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Session event:', { user: session?.user?.email, role: session?.user?.role });
      }
    },
  },
};
