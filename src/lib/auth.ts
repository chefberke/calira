import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db, usersTable } from "@/db";
import { teams } from "@/db/schema/teams";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";

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
  secret: process.env.NEXTAUTH_SECRET,
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
      async profile(profile) {
        // Check if user already exists in database
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, profile.email!))
          .limit(1);

        if (existingUser.length > 0) {
          // User exists, return with database ID
          return {
            id: existingUser[0].id,
            name: existingUser[0].name || profile.name,
            email: profile.email,
            image: existingUser[0].image || profile.picture,
          };
        }

        // User doesn't exist, create new user with string ID
        const newUser = await db
          .insert(usersTable)
          .values({
            id: randomUUID(), // Generate a unique string ID
            name: profile.name,
            email: profile.email!,
            image: profile.picture,
            emailVerified: new Date(), // Google users are email verified
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          id: newUser[0].id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
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
            id: user[0].id,
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
          // First, get the actual user from database to ensure we have the correct ID
          const dbUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, user.email!))
            .limit(1);

          if (dbUser.length === 0) {
            console.error("❌ User not found in database:", user.email);
            return true; // Don't fail sign-in
          }

          const actualUserId = dbUser[0].id;

          // Check if user already has teams
          const existingTeams = await db
            .select()
            .from(teams)
            .where(eq(teams.ownerId, actualUserId))
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
                  ownerId: actualUserId,
                },
                {
                  name: "Today",
                  description: "Tasks to focus on today",
                  emoji: "📅",
                  ownerId: actualUserId,
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
        // Get the actual user ID from database
        try {
          const dbUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, user.email!))
            .limit(1);

          if (dbUser.length > 0) {
            token.sub = dbUser[0].id;
          } else {
            token.sub = user.id;
          }
        } catch (error) {
          console.error("Error getting user ID for JWT:", error);
          token.sub = user.id;
        }
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
