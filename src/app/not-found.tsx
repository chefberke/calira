"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
        <div className="w-[300px] h-[200px] sm:w-[400px] sm:h-[280px] lg:w-[500px] lg:h-[350px] blur-[180px] sm:blur-[220px] lg:blur-[240px] rounded-full bg-gradient-to-r from-[#08203E] to-[#6036E9] z-0"></div>
      </div>

      {/* Main container */}
      <div className="relative h-screen w-full backdrop-blur-3xl bg-gray-300/50 rounded-none sm:rounded-2xl lg:rounded-3xl flex z-10 items-center justify-center">
        <div className="text-center space-y-6">
          {/* Spinner */}
          <div className="flex items-center justify-center">
            <motion.div
              className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Text */}
          <p className="text-gray-700 text-xl">We are working on it.</p>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="text-sm font-medium px-4 py-2 rounded-lg text-neutral-700 hover:translate-y-[-1px] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}