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
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCreateTask, useTeams } from "@/lib/hooks/useTasks";

interface CreateTaskProps {
  defaultTeam?: "home" | "today";
}

function CreateTask({ defaultTeam = "home" }: CreateTaskProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isListSelectorOpen, setIsListSelectorOpen] = useState(false);
  const [isCheckboxAnimating, setIsCheckboxAnimating] = useState(false);
  const [title, setTitle] = useState("");
  const [completed, setCompleted] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const createTaskMutation = useCreateTask();

  const teams = teamsData?.teams || [];
  const homeTeam = teams.find((team) => team.name.toLowerCase() === "home");
  const todayTeam = teams.find((team) => team.name.toLowerCase() === "today");

  useEffect(() => {
    if (teams.length > 0 && selectedTeamId === "") {
      if (defaultTeam === "today" && todayTeam) {
        setSelectedTeamId(todayTeam.id.toString());
      } else if (homeTeam) {
        setSelectedTeamId(homeTeam.id.toString());
      }
    }
  }, [teams, homeTeam, todayTeam, selectedTeamId, defaultTeam]);

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const onSubmit = async () => {
    try {
      if (!homeTeam || !title || title.trim() === "") {
        return;
      }

      const targetTeamId =
        selectedTeamId && selectedTeamId !== ""
          ? parseInt(selectedTeamId)
          : homeTeam.id;

      // Check if "Today" team is selected and no date is explicitly chosen
      const selectedTeam = teams.find((team) => team.id === targetTeamId);
      let finalDueDate = selectedDate?.toISOString();

      if (selectedTeam?.name.toLowerCase() === "today" && !selectedDate) {
        // If "Today" is selected but no date is chosen, use today's date
        finalDueDate = new Date().toISOString();
      }

      await createTaskMutation.mutateAsync({
        title: title.trim(),
        teamId: targetTeamId,
        completed,
        dueDate: finalDueDate,
      });

      setTitle("");
      setCompleted(false);
      setSelectedTeamId(homeTeam.id.toString());
      setSelectedDate(undefined);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      // Handle errors silently for now
    }
  };

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
    onSubmit();
  };

  return (
    <div className="w-full max-w-2xl">
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
                      checked={completed}
                      onCheckedChange={(checked) => {
                        setIsCheckboxAnimating(true);
                        setCompleted(checked as boolean);
                        setTimeout(() => setIsCheckboxAnimating(false), 200);
                      }}
                      className="w-5 h-5 border-none bg-neutral-200 data-[state=checked]:bg-neutral-700"
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
              className={`h-14 rounded-2xl bg-gray-300/50 border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-none font-medium transition-all duration-200 ${
                isFocused ? "pl-14 pr-80" : "pl-4 pr-24"
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
                if (e.key === "Enter" && !createTaskMutation.isPending) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              disabled={createTaskMutation.isPending}
            />

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
                        className="w-28 h-8 bg-neutral-100 border border-neutral-200 text-xs cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={teamsLoading}
                      >
                        <SelectValue
                          placeholder={teamsLoading ? "Loading..." : "No list"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {homeTeam && (
                          <SelectItem value={homeTeam.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Image
                                src="/mini.svg"
                                alt="No list"
                                width={10}
                                height={10}
                              />
                              No list
                            </div>
                          </SelectItem>
                        )}

                        {teams
                          .filter((team) => team.name.toLowerCase() !== "home")
                          .map((team) => {
                            const getTeamIcon = () => {
                              const teamNameLower = team.name.toLowerCase();
                              if (teamNameLower === "today") {
                                return (
                                  <Image
                                    src="/calendar.svg"
                                    alt="Today"
                                    width={12}
                                    height={12}
                                  />
                                );
                              } else {
                                return (
                                  <span className="text-sm">{team.emoji}</span>
                                );
                              }
                            };

                            return (
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  {getTeamIcon()}
                                  {team.name}
                                </div>
                              </SelectItem>
                            );
                          })}
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
  );
}

export default CreateTask;
