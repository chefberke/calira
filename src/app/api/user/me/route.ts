import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, accounts } from "@/db/schema/users";
import { tasks as tasksTable } from "@/db/schema/tasks";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user information
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = user[0];

    // Fallback: Ensure user has default teams
    try {
      const { teams } = await import("@/db/schema/teams");
      const existingTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.ownerId, session.user.id))
        .limit(1);

      if (existingTeams.length === 0) {
        await db.insert(teams).values([
          {
            name: "Home",
            description: "Your personal workspace for organizing tasks",
            emoji: "🏠",
            ownerId: session.user.id,
          },
          {
            name: "Today",
            description: "Tasks to focus on today",
            emoji: "📅",
            ownerId: session.user.id,
          },
        ]);
      }
    } catch (teamError) {
      console.error("Failed to create fallback teams:", teamError);
      // Don't fail the request if team creation fails
    }

    // Get user's account information to determine provider
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.user.id));

    // Check if user has Google provider
    const hasGoogleProvider = userAccounts.some(
      (account) => account.provider === "google"
    );

    // Get user's task count
    const [taskCountResult] = await db
      .select({ count: count() })
      .from(tasksTable)
      .where(eq(tasksTable.createdById, session.user.id));

    const taskCount = taskCountResult?.count || 0;

    // Format response
    const response = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      createdAt: userData.createdAt,
      provider: hasGoogleProvider ? "google" : "credentials",
      taskCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
