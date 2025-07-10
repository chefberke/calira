"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Validation schema
const createTaskSchema = z.object({
  task: z
    .string()
    .min(1, "Task cannot be empty")
    .max(200, "Task must be less than 200 characters"),
  completed: z.boolean(),
  list: z.string().optional(),
  dueDate: z.date().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

function CreateTask() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isListSelectorOpen, setIsListSelectorOpen] = useState(false);
  const [isCheckboxAnimating, setIsCheckboxAnimating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      completed: false,
      list: "none",
    },
  });

  const completedValue = watch("completed");
  const listValue = watch("list");

  // Auto-close focus when all dropdowns are closed
  useEffect(() => {
    if (isFocused && !isDatePickerOpen && !isListSelectorOpen) {
      const timer = setTimeout(() => {
        if (
          !document.activeElement ||
          document.activeElement === document.body
        ) {
          setIsFocused(false);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isFocused, isDatePickerOpen, isListSelectorOpen]);

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      console.log("New task:", data);
      // TODO: Add task creation logic here
      reset({
        completed: false,
        list: "none",
      });
      setSelectedDate(undefined);
      // Keep focus after submit
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleShortcutClick = () => {
    inputRef.current?.focus();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setValue("dueDate", date);
    setIsDatePickerOpen(false);
    // Refocus input after date selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Mock lists data - replace with real data
  const lists = [
    { id: "none", name: "No list" },
    { id: "personal", name: "Personal" },
    { id: "work", name: "Work" },
    { id: "shopping", name: "Shopping" },
  ];

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex items-center">
          {/* Input Container */}
          <div className="relative flex-1 flex items-center">
            {/* Animated Checkbox */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-3 h-14 flex items-center z-10"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <motion.div
                    animate={{
                      scale: isCheckboxAnimating ? [1, 0.85, 1] : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                    className="flex items-center"
                  >
                    <Checkbox
                      checked={completedValue}
                      onCheckedChange={(checked) => {
                        setIsCheckboxAnimating(true);
                        setValue("completed", checked as boolean);
                        setTimeout(() => setIsCheckboxAnimating(false), 200);
                      }}
                      className="w-5 h-5 border-none bg-neutral-200 data-[state=checked]:bg-neutral-700"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              {...register("task")}
              ref={inputRef}
              placeholder="Write a new task"
              className={`h-14 bg-neutral-100 rounded-2xl border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-none font-medium transition-all duration-200 ${
                isFocused ? "pl-14 pr-80" : "pl-4 pr-24"
              }`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Only close if no dropdowns are open
                setTimeout(() => {
                  if (!isDatePickerOpen && !isListSelectorOpen) {
                    setIsFocused(false);
                  }
                }, 100);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(onSubmit)();
                }
              }}
            />

            {/* Right Side Controls */}
            <div className="absolute right-3 flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isFocused ? (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center gap-2"
                  >
                    {/* Date Picker */}
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={(open) => {
                        setIsDatePickerOpen(open);
                        // If closing the popover, refocus input
                        if (!open) {
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 50);
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-8 bg-neutral-100 border border-neutral-200 rounded-md flex items-center justify-center cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <Image
                            src="/calendar.svg"
                            alt="Calendar"
                            width={14}
                            height={14}
                          />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* List Selector */}
                    <Select
                      value={listValue}
                      onValueChange={(value) => setValue("list", value)}
                      onOpenChange={(open) => {
                        setIsListSelectorOpen(open);
                        // If closing the select, refocus input
                        if (!open) {
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 50);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="w-28 h-8 bg-neutral-100 border border-neutral-200 text-xs cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            <div className="flex items-center gap-2">
                              {list.id === "none" && (
                                <Image
                                  src="/mini.svg"
                                  alt="No list"
                                  width={10}
                                  height={10}
                                />
                              )}
                              {list.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                ) : (
                  <motion.button
                    key="shortcut"
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    type="button"
                    onClick={handleShortcutClick}
                    className="flex items-center gap-1"
                  >
                    <div className="rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-600 transition-colors">
                      ⌘
                    </div>
                    <div className="rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-600 transition-colors">
                      D
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {errors.task && (
          <span className="text-neutral-500 text-xs mt-1 block ml-3">
            {errors.task.message}
          </span>
        )}
      </form>
    </div>
  );
}

export default CreateTask;
