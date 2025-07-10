"use client";

import Sidebar from "@/components/shared/Sidebar";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import Image from "next/image";

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background blur effect - responsive */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
        <div className="w-[300px] h-[200px] sm:w-[400px] sm:h-[280px] lg:w-[500px] lg:h-[350px] blur-[180px] sm:blur-[220px] lg:blur-[240px] rounded-full bg-gradient-to-r from-[#08203E] to-[#6036E9] z-0"></div>
      </div>

      {/* Main container */}
      <div className="relative h-screen w-full backdrop-blur-3xl bg-gray-300/50 rounded-none sm:rounded-2xl lg:rounded-3xl flex z-10">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:flex flex-shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-neutral-200 hover:bg-white/90 transition-all duration-200"
                aria-label="Open menu"
              >
                <Image
                  src="/more.svg"
                  alt="Menu"
                  width={20}
                  height={20}
                  className="w-5 h-5 text-neutral-700"
                />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 p-0 bg-white/95 backdrop-blur-xl"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="h-full">
                <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content area - responsive */}
        <div className="flex-1 h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}
