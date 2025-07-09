"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: "blur(2px)",
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  out: {
    opacity: 0,
    scale: 1.02,
    filter: "blur(1px)",
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.5,
};

// Container animation for smooth enter/exit
const containerVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={containerVariants}
        className={className}
      >
        <motion.div
          variants={pageVariants}
          transition={pageTransition}
          className="will-change-transform"
          style={{
            transformOrigin: "center center",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
