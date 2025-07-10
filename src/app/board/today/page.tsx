"use client";

import React from "react";
import Image from "next/image";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Tasks from "@/components/shared/Tasks";

function page() {
  return (
    <PageTransition>
      <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
        <div className="mb-6 lg:mb-8">
          {/* Today header with emoji and more icon */}
          <div className="mb-2 flex justify-between items-start group">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                Today
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
        <CreateTask defaultTeam="today" />
        <Tasks today={true} />
      </div>
    </PageTransition>
  );
}

export default page;
