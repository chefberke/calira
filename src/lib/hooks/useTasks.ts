import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/db/schema/tasks";
import { Team } from "@/db/schema/teams";

// Types for API requests and responses
export interface CreateTaskRequest {
  title: string;
  description?: string;
  teamId: number;
  assignedToId?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  emoji?: string;
}

export interface UpdateTeamRequest {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
}

export interface CreateTeamResponse {
  message: string;
  team: Team;
}

export interface UpdateTeamResponse {
  message: string;
  team: Team;
}

export interface DeleteTeamResponse {
  message: string;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  teamId?: number;
  assignedToId?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface CreateTaskResponse {
  message: string;
  task: Task;
}

export interface UpdateTaskResponse {
  message: string;
  task: Task;
}

export interface DeleteTaskResponse {
  message: string;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskCountsResponse {
  counts: {
    home: number;
    today: number;
    teams: { [key: number]: number };
  };
}

// API functions
const createTask = async (
  data: CreateTaskRequest
): Promise<CreateTaskResponse> => {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  return response.json();
};

const updateTask = async (
  data: UpdateTaskRequest
): Promise<UpdateTaskResponse> => {
  const response = await fetch("/api/tasks", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  return response.json();
};

const deleteTask = async (id: number): Promise<DeleteTaskResponse> => {
  const response = await fetch(`/api/tasks?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete task");
  }

  return response.json();
};

const duplicateTask = async (
  originalTask: Task
): Promise<CreateTaskResponse> => {
  const duplicateData: CreateTaskRequest = {
    title: `${originalTask.title} (Copy)`,
    description: originalTask.description || undefined,
    teamId: originalTask.teamId,
    assignedToId: originalTask.assignedToId || undefined,
    dueDate: originalTask.dueDate
      ? originalTask.dueDate instanceof Date
        ? originalTask.dueDate.toISOString()
        : originalTask.dueDate
      : undefined,
    completed: false, // Always create duplicates as incomplete
  };

  return createTask(duplicateData);
};

const createTeam = async (
  data: CreateTeamRequest
): Promise<CreateTeamResponse> => {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create team");
  }

  return response.json();
};

const updateTeam = async (
  data: UpdateTeamRequest
): Promise<UpdateTeamResponse> => {
  const response = await fetch("/api/teams", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update team");
  }

  return response.json();
};

const deleteTeam = async (id: number): Promise<DeleteTeamResponse> => {
  const response = await fetch(`/api/teams?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete team");
  }

  return response.json();
};

const getTeams = async (): Promise<TeamsResponse> => {
  const response = await fetch("/api/teams");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch teams");
  }

  return response.json();
};

const getTasks = async (params?: {
  teamId?: number;
  completed?: boolean;
  today?: boolean;
}): Promise<TasksResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.teamId) {
    searchParams.append("teamId", params.teamId.toString());
  }

  if (params?.completed !== undefined) {
    searchParams.append("completed", params.completed.toString());
  }

  if (params?.today) {
    searchParams.append("today", "true");
  }

  const response = await fetch(`/api/tasks?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch tasks");
  }

  return response.json();
};

const getTaskCounts = async (): Promise<TaskCountsResponse> => {
  const response = await fetch("/api/tasks/count");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch task counts");
  }

  return response.json();
};

// Hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTaskData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks"]);

      // Create an optimistic task with a temporary ID
      const optimisticTask = {
        id: Date.now(), // Temporary ID
        title: newTaskData.title,
        description: newTaskData.description || null,
        teamId: newTaskData.teamId,
        createdById: "temp", // Will be replaced by server response
        assignedToId: newTaskData.assignedToId || "temp",
        dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate) : null,
        completed: newTaskData.completed || false,
        completedAt: newTaskData.completed ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old?.tasks) return { tasks: [optimisticTask] };

        return {
          ...old,
          tasks: [optimisticTask, ...old.tasks], // Add to the beginning for newest first
        };
      });

      // Return a context with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTaskData, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      console.error("Error creating task:", err);
    },
    onSuccess: () => {
      // Invalidate and refetch to get the actual task with real ID from server
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskCounts"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old?.tasks) return old;

        return {
          ...old,
          tasks: old.tasks.map((task: any) =>
            task.id === newTask.id
              ? { ...task, ...newTask, updatedAt: new Date().toISOString() }
              : task
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      console.error("❌ Update task error:", err);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      console.error("Error updating task:", err);
    },
    onSuccess: () => {
      // Invalidate queries only on success to ensure counts are updated correctly
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskCounts"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // Invalidate and refetch tasks when a task is deleted
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskCounts"] });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
    },
  });
};

export const useDuplicateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateTask,
    onSuccess: () => {
      // Invalidate and refetch tasks when a task is duplicated
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskCounts"] });
    },
    onError: (error) => {
      console.error("Error duplicating task:", error);
    },
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useTasks = (params?: {
  teamId?: number;
  completed?: boolean;
  today?: boolean;
}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTaskCounts = () => {
  return useQuery({
    queryKey: ["taskCounts"],
    queryFn: async () => {
      const result = await getTaskCounts();

      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent updates for counts
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      // Invalidate and refetch teams when a team is created
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      console.error("Error creating team:", error);
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeam,
    onMutate: async (newTeamData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      // Snapshot the previous value
      const previousTeams = queryClient.getQueryData(["teams"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["teams"], (old: any) => {
        if (!old?.teams) return old;

        return {
          ...old,
          teams: old.teams.map((team: any) =>
            team.id === newTeamData.id
              ? { ...team, ...newTeamData, updatedAt: new Date().toISOString() }
              : team
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousTeams };
    },
    onError: (err, newTeamData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTeams) {
        queryClient.setQueryData(["teams"], context.previousTeams);
      }
      console.error("Error updating team:", err);
    },
    onSuccess: () => {
      // Invalidate and refetch teams when a team is updated
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onMutate: async (teamId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["teams"] });
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["taskCounts"] });

      // Snapshot the previous values
      const previousTeams = queryClient.getQueryData(["teams"]);
      const previousTasks = queryClient.getQueryData(["tasks"]);
      const previousTaskCounts = queryClient.getQueryData(["taskCounts"]);

      // Optimistically update teams
      queryClient.setQueryData(["teams"], (old: any) => {
        if (!old?.teams) return old;

        return {
          ...old,
          teams: old.teams.filter((team: any) => team.id !== teamId),
        };
      });

      // Optimistically update tasks (remove tasks from this team)
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old?.tasks) return old;

        return {
          ...old,
          tasks: old.tasks.filter((task: any) => task.teamId !== teamId),
        };
      });

      // Return a context object with the snapshotted values
      return { previousTeams, previousTasks, previousTaskCounts };
    },
    onError: (err, teamId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTeams) {
        queryClient.setQueryData(["teams"], context.previousTeams);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      if (context?.previousTaskCounts) {
        queryClient.setQueryData(["taskCounts"], context.previousTaskCounts);
      }
      console.error("Error deleting team:", err);
    },
    onSuccess: () => {
      // Invalidate and refetch all related queries when a team is deleted
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskCounts"] });
    },
  });
};
