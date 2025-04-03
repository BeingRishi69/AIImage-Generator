import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyCredentials, seedInitialUser, getUserByEmail, createUser } from "@/app/lib/db/userDb";
import { addInitialCredits } from "@/app/lib/db/creditsDb";
import bcrypt from "bcryptjs";

// Define JWT token type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

// Seed initial user when the API is first accessed
seedInitialUser().catch(console.error);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Verify credentials using our Supabase database
          const user = await verifyCredentials(
            credentials.email,
            credentials.password
          );
          
          return user;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google and other OAuth providers, ensure user exists in our database
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Check if user already exists in our database
          const existingUser = await getUserByEmail(profile.email);
          
          if (!existingUser) {
            // Create a new user in our database
            const newUser = await createUser({
              name: profile.name || 'Google User',
              email: profile.email,
              password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
            });
            
            // Add initial credits for new user
            await addInitialCredits(newUser.id, 10);
          } else {
            // Existing user, ensure they have initial credits
            await addInitialCredits(existingUser.id, 10);
          }
        } catch (error) {
          console.error("Error creating user from Google profile:", error);
          // Still allow sign in even if syncing to our DB fails
        }
      } else if (user && user.id) {
        // Add initial credits for new users signing up with credentials
        await addInitialCredits(user.id as string, 10);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 