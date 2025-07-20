import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { teams } from "@/db/schema/teams";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = signUpSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with string ID
    const newUser = await db
      .insert(users)
      .values({
        id: randomUUID(), // Generate a unique string ID
        email,
        password: hashedPassword,
        name: email.split("@")[0], // Use email prefix as default name
      })
      .returning();

    if (!newUser.length) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const user = newUser[0];

    // Create default teams for the new user
    try {
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
    } catch (teamError) {
      console.error("Failed to create default teams:", teamError);
      // Don't fail the registration if team creation fails
      // User can create teams manually later
    }

    // Return success (don't send password back)
    const { ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
