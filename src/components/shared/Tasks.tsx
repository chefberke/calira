"use client";

import React, { useState } from "react";
import Task from "@/components/shared/Task";
import { motion, AnimatePresence } from "framer-motion";
import {
  useTasks,
  useUpdateTask,
  useDeleteTask,
  useDuplicateTask,
  useTeams,
} from "@/lib/hooks/useTasks";

interface TasksProps {
  teamId?: number;
  showCompleted?: boolean;
  today?: boolean;
}

function Tasks({ teamId, showCompleted = true, today = false }: TasksProps) {
  const {
    data: tasksData,
    isLoading,
    error,
  } = useTasks({
    teamId,
    completed: showCompleted ? undefined : false,
    today,
  });

  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const duplicateTaskMutation = useDuplicateTask();

  const tasks = tasksData?.tasks || [];
  const teams = teamsData?.teams || [];

  // Helper function to get team info for a task
  const getTeamInfo = (taskTeamId: number) => {
    return teams.find((team) => team.id === taskTeamId);
  };

  // Helper function to get appropriate icon/emoji for team
  const getTeamIconOrEmoji = (team: any) => {
    if (!team) return "/mini.svg";

    const teamNameLower = team.name.toLowerCase();

    // Home team uses default icon
    if (teamNameLower === "home") {
      return "/mini.svg";
    }

    // Today team uses calendar icon
    if (teamNameLower === "today") {
      return "/calendar.svg";
    }

    // Other teams use their emoji
    return team.emoji || "/mini.svg";
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    // This function is now primarily for any additional handling
    // since Task component handles the API call directly
    console.log("Task toggled:", id, completed);
  };

  const handleEdit = (id: string) => {
    // The edit functionality is handled within the Task component itself
    // through the edit sheet, so we don't need to do anything here
    console.log("Edit task:", id);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const taskToDuplicate = tasks.find((task) => task.id.toString() === id);
      if (taskToDuplicate) {
        await duplicateTaskMutation.mutateAsync(taskToDuplicate);
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(parseInt(id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (isLoading || teamsLoading || error) {
    return (
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => {
          const team = getTeamInfo(task.teamId);
          const iconOrEmoji = getTeamIconOrEmoji(team);
          const isEmoji = !iconOrEmoji.startsWith("/");

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                layout: { duration: 0.2 },
              }}
            >
              <Task
                id={task.id.toString()}
                title={task.title}
                completed={task.completed}
                dueDate={task.dueDate ? task.dueDate.toString() : undefined}
                category={team?.name || "Task"}
                categoryIcon={isEmoji ? undefined : iconOrEmoji}
                categoryEmoji={isEmoji ? iconOrEmoji : undefined}
                description={task.description || ""}
                teamId={task.teamId}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default Tasks;
