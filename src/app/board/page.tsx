"use client";

import React from "react";
import Image from "next/image";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Task from "@/components/shared/Task";

function page() {
  // Mock user data
  const user = {
    name: "Berke Kanber",
    avatar: "/avatar.jpg", // placeholder
  };

  // Get current time and determine greeting
  const now = new Date();
  const hour = now.getHours();

  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    greeting = "Good evening";
  } else {
    greeting = "Good night";
  }

  // Format date
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
  } as const;
  const formattedDate = now.toLocaleDateString("en-US", options);

  return (
    <PageTransition>
      <div className="w-full h-full py-10 px-64">
        <div className="mb-8">
          {/* Greeting and user info with more icon */}
          <div className="mb-2 flex justify-between items-start group">
            <div>
              <h1 className="text-3xl font-semibold text-gray-700">
                {greeting}, {user.name.split(" ")[0]}!
              </h1>
              {/* Date display with greyish color directly below */}
              <p className="text-gray-500 text-2xl">It's {formattedDate}</p>
            </div>
            <Image
              src="/more.svg"
              alt="More options"
              width={24}
              height={24}
              className="cursor-pointer opacity-0 group-hover:opacity-40 hover:opacity-60 transition-opacity duration-200"
            />
          </div>
        </div>
        <CreateTask />
        <Task />
      </div>
    </PageTransition>
  );
}

export default page;
