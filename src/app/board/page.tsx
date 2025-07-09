import Sidebar from "@/components/shared/Sidebar";
import Screenbar from "@/components/shared/Screenbar";
import React from "react";

function page() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
        <div className="w-[500px] h-[350px] blur-[250px] rounded-full bg-gradient-to-r from-[#08203E] to-[#6036E9] z-0"></div>
      </div>

      <div className="relative h-screen w-full backdrop-blur-3xl bg-gray-300/50 rounded-3xl flex z-10">
        <Sidebar />
        <Screenbar />
      </div>
    </div>
  );
}

export default page;
