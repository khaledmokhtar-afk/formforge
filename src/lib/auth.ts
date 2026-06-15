import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn:  '/auth/signin',
    signOut: '/auth/signout',
    error:   '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id      = user.id
        session.user.credits = (user as { credits?: number }).credits ?? 0
        session.user.role    = (user as { role?: string }).role ?? 'USER'
      }
      return session
    },
  },
  session: { strategy: 'database' },
}
