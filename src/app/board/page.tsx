"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/shared/PageTransition";
import CreateTask from "@/components/shared/CreateTask";
import Tasks from "@/components/shared/Tasks";
import UserSettings from "@/components/shared/UserSettings";
import { Onboarding } from "@/components/shared/Onboarding";
import { useUser } from "@/lib/hooks/useTasks";
import { motion } from "framer-motion";

function Page() {
  const router = useRouter();

  // Get user data from API
  const { data: userData, isLoading, error } = useUser();

  // Redirect to sign-in if user data is not available and not loading
  useEffect(() => {
    if (!isLoading && (error || !userData)) {
      router.push("/sign-in");
    }
  }, [isLoading, error, userData, router]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
          <div className="mb-6 lg:mb-8">
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
        </div>
      </PageTransition>
    );
  }

  // If error or no user data, show loading while redirecting
  if (error || !userData) {
    return (
      <PageTransition>
        <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
          <div className="mb-6 lg:mb-8">
            <div className="mb-2 flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                  Redirecting to login...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const user = userData;

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
      <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-20 2xl:px-64">
        <div className="mb-6 lg:mb-8">
          {/* Greeting and user info with more icon */}
          <div className="mb-2 flex justify-between items-start group">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                {greeting}, {user.name.split(" ")[0]}!
              </h1>
              {/* Date display with greyish color directly below */}
              <p className="text-gray-500 text-xl sm:text-2xl">
                It&apos;s {formattedDate}
              </p>
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
        <CreateTask />
        <Tasks />
        <Onboarding autoShow={true} />
      </div>
    </PageTransition>
  );
}

export default Page;
