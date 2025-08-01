"use client";

import Image from "next/image";
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
import { motion, AnimatePresence } from "framer-motion";

function Grids() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isListSelectorOpen, setIsListSelectorOpen] = useState(false);
  const [isCheckboxAnimating, setIsCheckboxAnimating] = useState(false);
  const [title, setTitle] = useState("");
  const [completed, setCompleted] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("home");

  const [activeNavItem, setActiveNavItem] = useState("home");

  const teams = [
    { id: "home", name: "No list", emoji: "" },
    { id: "today", name: "Today", emoji: "" },
  ];

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: "/house.svg",
      count: 5,
      isActive: activeNavItem === "home",
    },
    {
      id: "today",
      label: "Today",
      icon: "/calendar.svg",
      count: 3,
      isActive: activeNavItem === "today",
    },
    {
      id: "team1",
      label: "Work Projects",
      emoji: "💼",
      count: 8,
      isActive: false,
    },
    {
      id: "team2",
      label: "Personal",
      emoji: "🏠",
      count: 2,
      isActive: false,
    },
    {
      id: "team3",
      label: "Shopping",
      emoji: "🛒",
      count: 0,
      isActive: false,
    },
  ] as Array<{
    id: string;
    label: string;
    icon?: string;
    emoji?: string;
    count: number;
    isActive: boolean;
  }>;

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

  const handleShortcutClick = () => {
    inputRef.current?.focus();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleNavItemClick = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setActiveNavItem(itemId);
  };

  const getNavItemStyles = (item: {
    id: string;
    label: string;
    icon?: string;
    emoji?: string;
    count: number;
    isActive: boolean;
  }) => {
    return `flex w-full justify-between items-center rounded-lg p-3 transition-all duration-200 hover:bg-neutral-100 group cursor-pointer ${
      item.isActive
        ? "bg-neutral-100 text-neutral-900"
        : "text-neutral-800 hover:text-neutral-900"
    }`;
  };

  const getNavIconStyles = (item: {
    id: string;
    label: string;
    icon?: string;
    emoji?: string;
    count: number;
    isActive: boolean;
  }) => {
    return item.isActive
      ? "text-neutral-900"
      : "text-neutral-700 group-hover:text-neutral-900";
  };

  const getNavCountStyles = (item: {
    id: string;
    label: string;
    icon?: string;
    emoji?: string;
    count: number;
    isActive: boolean;
  }) => {
    return item.isActive
      ? "bg-neutral-200 text-neutral-700"
      : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-700";
  };

  return (
    <div className="w-full h-full pt-36">
      <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-2 gap-4 md:gap-6 w-full h-full">
        <div className="col-span-1 md:col-span-2 w-full h-auto md:h-90 bg-neutral-50 rounded-xl shadow-sm p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0">
          <div className="flex-1 md:pr-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">
              Create Tasks Effortlessly
            </h2>
            <p className="text-sm md:text-base text-neutral-500 leading-relaxed">
              Organize your daily tasks with our intuitive interface. Set due
              dates, choose lists, and track your progress all in one place.
            </p>
          </div>

          <div className="flex-1 max-w-full md:max-w-md">
            <form onSubmit={handleFormSubmit} className="relative">
              <div className="flex items-center">
                <div className="relative flex-1 flex items-center">
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-3 h-12 md:h-14 flex items-center z-10"
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
                            checked={completed}
                            onCheckedChange={(checked) => {
                              setIsCheckboxAnimating(true);
                              setCompleted(checked as boolean);
                              setTimeout(
                                () => setIsCheckboxAnimating(false),
                                200
                              );
                            }}
                            className="w-4 md:w-5 h-4 md:h-5 border-none bg-neutral-200 data-[state=checked]:bg-neutral-700"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write a new task"
                    className={`h-12 md:h-14 rounded-2xl bg-gray-200/50 border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-none font-medium transition-all duration-200 ${
                      isFocused
                        ? "pl-12 md:pl-14 pr-28 md:pr-36"
                        : "pl-4 pr-12 md:pr-16"
                    }`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!isDatePickerOpen && !isListSelectorOpen) {
                          setIsFocused(false);
                        }
                      }, 100);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFormSubmit(e);
                      }
                    }}
                  />

                  <div className="absolute right-3 flex items-center gap-1 md:gap-2">
                    <AnimatePresence mode="wait">
                      {isFocused ? (
                        <motion.div
                          key="controls"
                          initial={{ opacity: 0, scale: 0.9, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: 10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="flex items-center gap-1 md:gap-2"
                        >
                          <Popover
                            open={isDatePickerOpen}
                            onOpenChange={(open) => {
                              setIsDatePickerOpen(open);
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
                                className="w-6 h-6 md:w-8 md:h-8 bg-neutral-100 border border-neutral-200 rounded-md flex items-center justify-center cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Image
                                  src="/calendar.svg"
                                  alt="Calendar"
                                  width={12}
                                  height={12}
                                  className="w-3 h-3 md:w-3.5 md:h-3.5"
                                />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          <Select
                            value={selectedTeamId}
                            onValueChange={(value) => setSelectedTeamId(value)}
                            onOpenChange={(open) => {
                              setIsListSelectorOpen(open);
                              if (!open) {
                                setTimeout(() => {
                                  inputRef.current?.focus();
                                }, 50);
                              }
                            }}
                          >
                            <SelectTrigger
                              className="w-20 md:w-28 h-6 md:h-8 bg-neutral-100 border border-neutral-200 text-xs cursor-pointer"
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              <SelectValue placeholder="No list" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  <div className="flex items-center gap-2">
                                    {team.id === "home" && (
                                      <Image
                                        src="/mini.svg"
                                        alt="No list"
                                        width={10}
                                        height={10}
                                      />
                                    )}
                                    {team.id === "today" && (
                                      <Image
                                        src="/calendar.svg"
                                        alt="Today"
                                        width={12}
                                        height={12}
                                      />
                                    )}
                                    {team.id !== "home" &&
                                      team.id !== "today" && (
                                        <span className="text-sm">
                                          {team.emoji}
                                        </span>
                                      )}
                                    {team.name}
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
                            Esc
                          </div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="row-start-auto md:row-start-2 w-full h-auto md:h-80 bg-neutral-50 rounded-xl shadow-sm pt-6 md:pt-8 px-4 md:px-8 pb-6 md:pb-0 flex flex-col items-center">
          <div className="text-start mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">
              Organize with Lists
            </h2>
            <p className="text-sm md:text-base text-neutral-500 leading-relaxed">
              Create custom lists for different projects and contexts. Keep your
              tasks organized with ease.
            </p>
          </div>

          <div className="w-full max-w-md h-full flex flex-col justify-end pb-0">
            <div className="w-full bg-white rounded-t-2xl p-4 md:p-6 shadow-sm border border-neutral-100 border-b-0">
              <div className="space-y-1">
                {navigationItems.slice(0, 2).map((item) => (
                  <motion.div
                    key={item.id}
                    className={getNavItemStyles(item)}
                    onClick={(e) => handleNavItemClick(e, item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={getNavIconStyles(item)}>
                        {item.emoji ? (
                          <span className="text-lg">{item.emoji}</span>
                        ) : item.icon ? (
                          <Image
                            src={item.icon}
                            alt={item.label}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                        ) : null}
                      </div>
                      <span className="font-semibold text-sm truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count > 0 && (
                        <div
                          className={`rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium ${getNavCountStyles(
                            item
                          )}`}
                        >
                          {item.count}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row-start-auto md:row-start-2 w-full h-auto md:h-80 bg-neutral-50 rounded-xl shadow-sm p-4 md:p-8 flex flex-col items-center">
          <div className="text-start mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">
              Work Faster with Shortcuts
            </h2>
            <p className="text-sm md:text-base text-neutral-500 leading-relaxed">
              Use keyboard shortcuts to create lists and manage tasks
              efficiently.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 flex-1">
            <div className="group">
              <div className="bg-white rounded-lg px-3 md:px-4 py-2 md:py-3 shadow-md border border-neutral-200 flex items-center justify-center min-w-[48px] md:min-w-[56px] hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-lg md:text-xl font-medium text-neutral-800">
                  ⌘
                </div>
              </div>
            </div>
            <div className="text-base md:text-lg font-light text-neutral-400">
              +
            </div>
            <div className="group">
              <div className="bg-white rounded-lg px-3 md:px-4 py-2 md:py-3 shadow-md border border-neutral-200 flex items-center justify-center min-w-[48px] md:min-w-[56px] hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-lg md:text-xl font-medium text-neutral-800">
                  E
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grids;
