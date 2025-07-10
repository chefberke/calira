import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import { teams } from "@/db/schema/teams";
import { eq, and, gte, lt, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's teams
    const userTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, session.user.id));

    // Find Home team
    const homeTeam = userTeams.find((team) => team.name === "Home");

    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Count all incomplete tasks for Home
    const homeCountResult = homeTeam
      ? await db
          .select({ count: count() })
          .from(tasks)
          .where(
            and(
              eq(tasks.createdById, session.user.id),
              eq(tasks.completed, false)
            )
          )
      : [{ count: 0 }];

    // Count today's incomplete tasks (all tasks with due date today, regardless of team)
    const todayCountResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.createdById, session.user.id),
          eq(tasks.completed, false),
          gte(tasks.dueDate, startOfDay),
          lt(tasks.dueDate, endOfDay)
        )
      );

    // Get task counts for each team (excluding Home and Today)
    const teamCounts: { [key: number]: number } = {};

    for (const team of userTeams) {
      if (team.name !== "Home") {
        const teamCountResult = await db
          .select({ count: count() })
          .from(tasks)
          .where(
            and(
              eq(tasks.createdById, session.user.id),
              eq(tasks.teamId, team.id),
              eq(tasks.completed, false)
            )
          );

        teamCounts[team.id] = teamCountResult[0]?.count || 0;
      }
    }

    return NextResponse.json({
      counts: {
        home: homeCountResult[0]?.count || 0,
        today: todayCountResult[0]?.count || 0,
        teams: teamCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching task counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
