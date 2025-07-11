import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { teams } from "@/db/schema/teams";
import { teamMembers } from "@/db/schema/team-members";
import { tasks } from "@/db/schema/tasks";
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

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Team name must be 50 characters or less" },
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

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { id, name, description, emoji } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Team name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Check if team exists and user owns it
    const existingTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (!existingTeam.length) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (existingTeam[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this team" },
        { status: 403 }
      );
    }

    // Update the team
    const [updatedTeam] = await db
      .update(teams)
      .set({
        name: name.trim(),
        description: description || null,
        emoji: emoji || null,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, id))
      .returning();

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get team ID from query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("id");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Check if team exists and user owns it
    const existingTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.id, parseInt(teamId)))
      .limit(1);

    if (!existingTeam.length) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (existingTeam[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this team" },
        { status: 403 }
      );
    }

    // Delete tasks associated with this team
    await db.delete(tasks).where(eq(tasks.teamId, parseInt(teamId)));

    // Delete team members
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.teamId, parseInt(teamId)));

    // Delete the team
    await db.delete(teams).where(eq(teams.id, parseInt(teamId)));

    return NextResponse.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
