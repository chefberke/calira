"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Tasks from "@/components/shared/Tasks";
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
    return (
      <PageTransition>
        <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Team not found</p>
          </div>
        </div>
      </PageTransition>
    );
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
            <Image
              src="/more.svg"
              alt="More options"
              width={24}
              height={24}
              className="cursor-pointer opacity-0 group-hover:opacity-40 hover:opacity-60 transition-opacity duration-200 hidden sm:block"
            />
          </div>
        </div>
        <CreateTask defaultTeam={currentTeam.id.toString()} />
        <Tasks teamId={currentTeam.id} />
      </div>
    </PageTransition>
  );
}

export default TeamPage;
