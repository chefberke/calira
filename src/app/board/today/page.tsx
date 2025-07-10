"use client";

import React from "react";
import PageTransition from "@/components/shared/PageTransition";

function page() {
  return (
    <PageTransition>
      <div className="w-full h-full py-6 sm:py-8 lg:py-10 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 2xl:px-64">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700">
            Today's Tasks
          </h1>
          <p className="text-gray-500 text-xl sm:text-2xl">
            Focus on what matters most
          </p>
        </div>
        {/* Today's tasks content will go here */}
        <div className="text-gray-500">
          Today's tasks functionality coming soon...
        </div>
      </div>
    </PageTransition>
  );
}

export default page;
