"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, type Variants } from "framer-motion";

// Animation variants
const navVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const logoVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
};

const buttonVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      duration: 0.5,
    },
  },
};

function Nav() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="flex items-center justify-between w-full h-20"
    >
      <motion.div variants={logoVariants}>
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={75} height={75} />
        </Link>
      </motion.div>

      <motion.div variants={buttonVariants}>
        <Link href="/sign-up">
          <button className="text-sm font-medium bg-neutral-50 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-all duration-300 hover:cursor-pointer">
            Get Started
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default Nav;
