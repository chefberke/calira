"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
};

const teamMembers = [
  {
    name: "Berke Kanber",
    role: "Software Developer",
    image: "/chefberke.png",
    color: "bg-orange-200",
  },
  {
    name: "Harun Demirci",
    role: "Software & Design Specialist",
    image: "/chefharun.png",
    color: "bg-blue-200",
  },
];

function Team() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full py-20"
    >
      <div className="max-w-6xl mx-auto px-4 py-12 bg-neutral-50 rounded-xl shadow-sm">
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
            The minds behind the mission
          </h2>
          <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;re a small team passionate about creating simple, focused
            tools that help people be more productive.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className="flex flex-col items-center text-center space-y-1"
            >
              <div
                className={`relative w-16 h-16 rounded-full overflow-hidden ${member.color}`}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover scale-110"
                />
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-base font-medium text-neutral-900 mb-0.5">
                  {member.name}
                </h3>
                <p className="text-sm text-neutral-600">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Team;
