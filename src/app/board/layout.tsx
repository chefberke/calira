import Sidebar from "@/components/shared/Sidebar";
import React from "react";

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
        <div className="w-[500px] h-[350px] blur-[240px] rounded-full bg-gradient-to-r from-[#08203E] to-[#6036E9] z-0"></div>
      </div>

      {/* Main container */}
      <div className="relative h-screen w-full backdrop-blur-3xl bg-gray-300/50 rounded-3xl flex z-10">
        {/* Sidebar - not fixed, just flex */}
        <div className="flex-shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Main content area - Screenbar and children */}
        <div className="flex-1 h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}
