"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { AppleHelloEnglishEffect } from "../ui/apple-hello-effect";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

// Animation variants
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
};

const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 12,
      duration: 0.8,
      delay: 0.2,
    },
  },
};

function Hero() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center w-full h-full pt-32"
    >
      <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
        {/* Main heading with apple effect */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-normal text-gray-900 leading-[0.9] tracking-tight">
            Say{" "}
            <span className="relative inline-block">
              <AppleHelloEnglishEffect
                speed={1.3}
                className="h-16 sm:h-20 lg:h-24 text-gray-900"
              />
            </span>
          </h1>
          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-normal text-gray-900 leading-[0.9] tracking-tight">
            to simplicity
          </h2>
        </motion.div>

        {/* Minimal description */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-700 max-w-lg font-normal leading-relaxed"
        >
          Simple. Focused. Productive.
        </motion.p>

        {/* Simple CTA */}
        <motion.div variants={itemVariants}>
          <Link href="/sign-up">
            <button className="text-sm font-medium flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-all duration-300 hover:cursor-pointer">
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>

        <motion.div variants={imageVariants} className="w-full h-full mt-10">
          <Image
            src="/hero.png"
            alt="hero-image"
            width={1920}
            height={1440}
            className="w-full h-full object-cover rounded-xl shadow-lg border border-neutral-200"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Hero;
