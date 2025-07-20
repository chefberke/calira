import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import { teams } from "@/db/schema/teams";
import { eq, and, desc, gte, lt } from "drizzle-orm";
import { z } from "zod";

// Validation schema for creating a task
const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title cannot be empty")
    .max(255, "Task title must be less than 255 characters"),
  description: z.string().optional(),
  teamId: z.number().int().positive("Team ID must be a positive integer"),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});

// Validation schema for updating a task
const updateTaskSchema = z.object({
  id: z.number().int().positive("Task ID must be a positive integer"),
  title: z
    .string()
    .min(1, "Task title cannot be empty")
    .max(255, "Task title must be less than 255 characters")
    .optional(),
  description: z.string().optional(),
  teamId: z
    .number()
    .int()
    .positive("Team ID must be a positive integer")
    .optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert session user id to number
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Verify that the team belongs to the user
    const team = await db
      .select()
      .from(teams)
      .where(and(eq(teams.id, validatedData.teamId), eq(teams.ownerId, userId)))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 403 }
      );
    }

    // Convert dueDate string to Date if provided
    const dueDate = validatedData.dueDate
      ? new Date(validatedData.dueDate)
      : undefined;

    // Create the task
    const newTask = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        teamId: validatedData.teamId,
        createdById: userId,
        assignedToId: validatedData.assignedToId
          ? Number(validatedData.assignedToId)
          : userId,
        dueDate,
        completed: validatedData.completed,
        completedAt: validatedData.completed ? new Date() : undefined,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: newTask[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert session user id to number
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const completed = searchParams.get("completed");
    const todayFilter = searchParams.get("today");

    // Build query conditions
    const whereConditions = [eq(tasks.createdById, userId)];

    if (teamId) {
      whereConditions.push(eq(tasks.teamId, parseInt(teamId)));
    }

    if (completed !== null) {
      whereConditions.push(eq(tasks.completed, completed === "true"));
    }

    // Add today filter if requested
    if (todayFilter === "true") {
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

      whereConditions.push(gte(tasks.dueDate, startOfDay));
      whereConditions.push(lt(tasks.dueDate, endOfDay));
    }

    // Fetch tasks
    const userTasks = await db
      .select()
      .from(tasks)
      .where(and(...whereConditions))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json({
      tasks: userTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
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

    // Convert session user id to number
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Verify that the task belongs to the user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, validatedData.id), eq(tasks.createdById, userId)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // If teamId is being updated, verify the new team belongs to the user
    if (validatedData.teamId) {
      const team = await db
        .select()
        .from(teams)
        .where(
          and(eq(teams.id, validatedData.teamId), eq(teams.ownerId, userId))
        )
        .limit(1);

      if (team.length === 0) {
        return NextResponse.json(
          { error: "Team not found or access denied" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      title?: string;
      description?: string | null;
      teamId?: number;
      assignedToId?: number | null;
      dueDate?: Date | null;
      completed?: boolean;
      completedAt?: Date | null;
    } = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.teamId !== undefined)
      updateData.teamId = validatedData.teamId;
    if (validatedData.assignedToId !== undefined)
      updateData.assignedToId = validatedData.assignedToId
        ? parseInt(validatedData.assignedToId)
        : null;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : null;
    }
    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed;
      // Set/unset completedAt based on completion status
      updateData.completedAt = validatedData.completed ? new Date() : null;
    }

    // Update the task
    const updatedTask = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, validatedData.id))
      .returning();

    return NextResponse.json({
      message: "Task updated successfully",
      task: updatedTask[0],
    });
  } catch (error) {
    console.error("Error updating task:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

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

    // Convert session user id to number
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get task ID from query parameters
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const taskIdNum = parseInt(taskId);
    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Verify that the task belongs to the user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskIdNum), eq(tasks.createdById, userId)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, taskIdNum));

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
