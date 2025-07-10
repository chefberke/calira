import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  users as usersTable,
  accounts as accountsTable,
  sessions as sessionsTable,
  verificationTokens as verificationTokensTable,
} from "@/db/schema/users";
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
  adapter: DrizzleAdapter(db, {
    usersTable,
    accountsTable,
    sessionsTable,
    verificationTokensTable,
  }),
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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect errors to sign-in page
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // If this is an OAuth sign-in (not credentials), check if user has teams and create them if they don't
      if (account?.provider !== "credentials" && user.id) {
        try {
          // Check if user already has teams
          const existingTeams = await db
            .select()
            .from(teams)
            .where(eq(teams.ownerId, user.id))
            .limit(1);

          // If no teams exist, create default teams
          if (existingTeams.length === 0) {
            await db.insert(teams).values([
              {
                name: "Home",
                description: "Your personal workspace for organizing tasks",
                emoji: "🏠",
                ownerId: user.id,
              },
              {
                name: "Today",
                description: "Tasks to focus on today",
                emoji: "📅",
                ownerId: user.id,
              },
            ]);
            console.log(`Created default teams for OAuth user: ${user.email}`);
          }
        } catch (teamError) {
          console.error(
            "Failed to create default teams for OAuth user:",
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
    async session({ session, user }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn(message) {
      console.log("User signed in:", message.user.email);
    },
    async signOut(message) {
      console.log("User signed out");
    },
  },
  debug: process.env.NODE_ENV === "development",
});
