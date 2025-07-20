"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, easeInOut, easeOut } from "framer-motion";

interface OnboardingProps {
  autoShow?: boolean;
  onComplete?: () => void;
}

function Onboarding({ autoShow = false, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const stepContent = [
    {
      title: "Welcome to Calira",
      description:
        "Your personal task management companion. Let's get you started with organizing your day.",
      lights: {
        primary: "from-indigo-400 via-violet-300 to-purple-300",
        secondary: "from-indigo-200 via-violet-200 to-purple-200",
        tertiary: "from-indigo-100 via-violet-100 to-purple-100",
      },
    },
    {
      title: "Create Tasks Easily",
      description:
        "Add new tasks with just a few clicks. Set priorities, due dates, and organize your workflow.",
      lights: {
        primary: "from-indigo-400 via-violet-300 to-purple-300",
        secondary: "from-indigo-200 via-violet-200 to-purple-200",
        tertiary: "from-indigo-100 via-violet-100 to-purple-100",
      },
    },
    {
      title: "Track Your Progress",
      description:
        "Monitor your daily progress and stay on top of your goals with our intuitive interface.",
      lights: {
        primary: "from-indigo-400 via-violet-300 to-purple-300",
        secondary: "from-indigo-200 via-violet-200 to-purple-200",
        tertiary: "from-indigo-100 via-violet-100 to-purple-100",
      },
    },
    {
      title: "Ready to Get Started?",
      description:
        "You're all set! Start creating your first task and begin your productive journey.",
      lights: {
        primary: "from-indigo-400 via-violet-300 to-purple-300",
        secondary: "from-indigo-200 via-violet-200 to-purple-200",
        tertiary: "from-indigo-100 via-violet-100 to-purple-100",
      },
    },
  ];

  const totalSteps = stepContent.length;

  // Check localStorage on component mount
  useEffect(() => {
    if (autoShow) {
      const hasCompletedOnboarding = localStorage.getItem(
        "calira-onboarding-completed"
      );
      if (!hasCompletedOnboarding) {
        setOpen(true);
      }
    }
  }, [autoShow]);

  const handleContinue = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    // Save completion status to localStorage
    localStorage.setItem("calira-onboarding-completed", "true");
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    // Save completion status to localStorage even when skipped
    localStorage.setItem("calira-onboarding-completed", "true");
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const currentStep = stepContent[step - 1];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: easeInOut,
      },
    },
  };

  const dialogVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: easeOut,
      },
    },
  };

  const lightsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!autoShow && (
        <DialogTrigger asChild>
          <Button variant="outline">Onboarding</Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="max-w-lg overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Onboarding</DialogTitle>
        <motion.div
          className="p-4 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex justify-center p-6"
            variants={logoVariants}
          >
            <div className="relative w-full">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${currentStep.lights.primary} rounded-2xl blur-3xl scale-200 opacity-80 transition-all duration-500`}
                variants={lightsVariants}
              ></motion.div>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${currentStep.lights.secondary} rounded-2xl blur-2xl scale-175 opacity-90 transition-all duration-500`}
                variants={lightsVariants}
              ></motion.div>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${currentStep.lights.tertiary} rounded-2xl blur-xl scale-150 opacity-70 transition-all duration-500`}
                variants={lightsVariants}
              ></motion.div>
              <div className="relative flex justify-center">
                <Image
                  src="/logo_classic.svg"
                  alt="Calira Logo"
                  width={500}
                  height={500}
                  className="h-16 w-16 drop-shadow-lg"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            key={step}
            className="space-y-2 pt-4 relative z-10"
            custom={direction}
            variants={dialogVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              {currentStep.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentStep.description}
            </p>
          </motion.div>

          <motion.div
            className="flex justify-start space-x-2 mb-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {[...Array(totalSteps)].map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-200",
                  index + 1 === step
                    ? "bg-gray-900 dark:bg-gray-100"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05, duration: 0.2 }}
              />
            ))}
          </motion.div>

          <motion.div
            className="flex justify-end items-center space-x-3"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip
            </Button>

            {step < totalSteps ? (
              <Button
                className="group cursor-pointer"
                type="button"
                onClick={handleContinue}
              >
                Next
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Button
                className="cursor-pointer"
                type="button"
                onClick={handleComplete}
              >
                Get Started
              </Button>
            )}
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export { Onboarding };
