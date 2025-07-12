"use client";

import React from "react";
import Image from "next/image";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Tasks from "@/components/shared/Tasks";
import UserSettings from "@/components/shared/UserSettings";

function page() {
  return (
    <PageTransition>
      <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
        <div className="mb-6 lg:mb-8">
          {/* Today header with emoji and more icon */}
          <div className="mb-2 flex justify-between items-start group">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">📅</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                Today
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
        <CreateTask defaultTeam="today" />
        <Tasks today={true} />
      </div>
    </PageTransition>
  );
}

export default page;
