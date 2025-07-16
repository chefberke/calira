"use client";

import React from "react";
import { BlurText } from "@/components/ui/animated-blur-text";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

function CoolText() {
  return (
    <div className="w-full py-20">
      <div className="max-w-4xl px-4 text-start">
        <BlurText
          text="Ready to get started?"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl sm:text-4xl mb-4 text-neutral-900 font-medium"
        />

        <p className="text-lg text-neutral-600 mb-8 max-w-2xl text-start">
          Simple task management to organize your daily work.
        </p>

        <Link href="/sign-up">
          <button className="text-sm font-medium flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-all duration-300 hover:cursor-pointer">
            Get Started
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CoolText;
