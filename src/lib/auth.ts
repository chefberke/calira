import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db, usersTable } from "@/db";
import { teams } from "@/db/schema/teams";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedFields = credentialsSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find user in database
          const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

          if (!user.length || !user[0].password) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            password,
            user[0].password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].name,
            image: user[0].image,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect errors to sign-in page
  },
  callbacks: {
    async signIn({ user }) {
      // Create teams for all users if they don't exist
      if (user.id) {
        try {
          const userId = Number(user.id);

          // Check if user already has teams
          const existingTeams = await db
            .select()
            .from(teams)
            .where(eq(teams.ownerId, userId))
            .limit(1);

          // If no teams exist, create default teams
          if (existingTeams.length === 0) {
            await db
              .insert(teams)
              .values([
                {
                  name: "Home",
                  description: "Your personal workspace for organizing tasks",
                  emoji: "🏠",
                  ownerId: userId,
                },
                {
                  name: "Today",
                  description: "Tasks to focus on today",
                  emoji: "📅",
                  ownerId: userId,
                },
              ])
              .returning();
          }
        } catch (teamError) {
          console.error(
            "❌ Failed to create default teams for user:",
            user.id,
            teamError
          );
          // Don't fail the sign-in if team creation fails
        }
      }

      // Allow all sign-ins
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/board";
    },
    async jwt({ token, user }) {
      // If this is the first time the JWT callback is called
      // after signing in, the user object will be available
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    async signIn() {},
    async signOut() {},
  },
  debug: process.env.NODE_ENV === "development",
});
