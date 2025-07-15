"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
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
  },
  {
    name: "Harun Demirci",
    role: "Software & Design Specialist",
    image: "/chefharun.png",
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
      <div className="max-w-6xl mx-auto px-4">
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-900 leading-tight tracking-tight mb-6">
            The minds behind the mission
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl leading-relaxed">
            We're a small team passionate about creating simple, focused tools
            that help people be more productive.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className="flex items-start space-x-4"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-neutral-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Team;
