"use client";

import React from "react";
import Image from "next/image";
import { redirect, useParams } from "next/navigation";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Tasks from "@/components/shared/Tasks";
import UserSettings from "@/components/shared/UserSettings";
import { useTeams } from "@/lib/hooks/useTasks";

function TeamPage() {
  const params = useParams();
  const teamId = params.id as string;

  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const teams = teamsData?.teams || [];

  // Find the current team by ID
  const currentTeam = teams.find((team) => team.id.toString() === teamId);

  if (teamsLoading) {
    return (
      <PageTransition>
        <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-400 rounded-full animate-spin" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!currentTeam) {
    redirect("/board");
  }

  return (
    <PageTransition>
      <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
        <div className="mb-6 lg:mb-8">
          {/* Team header with emoji/name and more icon */}
          <div className="mb-2 flex justify-between items-start group">
            <div className="flex items-center gap-3">
              {currentTeam.emoji ? (
                <span className="text-2xl sm:text-3xl">
                  {currentTeam.emoji}
                </span>
              ) : (
                <Image
                  src="/mini.svg"
                  alt="Team"
                  width={32}
                  height={32}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              )}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700 truncate max-w-xs sm:max-w-md">
                {currentTeam.name}
              </h1>
            </div>
            <UserSettings>
              <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <Image
                  src="/more.svg"
                  alt="More options"
                  width={20}
                  height={20}
                  className="opacity-60 hover:opacity-80 transition-opacity duration-200"
                />
              </div>
            </UserSettings>
          </div>
        </div>
        <CreateTask defaultTeam={currentTeam.id.toString()} />
        <Tasks teamId={currentTeam.id} />
      </div>
    </PageTransition>
  );
}

export default TeamPage;
