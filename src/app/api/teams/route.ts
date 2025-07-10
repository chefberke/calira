import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { teams } from "@/db/schema/teams";
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
