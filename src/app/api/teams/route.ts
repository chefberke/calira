import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { teams } from "@/db/schema/teams";
import { teamMembers } from "@/db/schema/team-members";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's teams
    const userTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, session.user.id))
      .orderBy(teams.createdAt);

    return NextResponse.json({
      teams: userTeams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { name, description, emoji } = await request.json();

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Create the team
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: name.trim(),
        description: description || null,
        emoji: emoji || null,
        ownerId: session.user.id,
      })
      .returning();

    // Add the owner as a team member
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
