"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTaskCounts, useCreateTeam, useTeams } from "@/lib/hooks/useTasks";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";

// Dynamically import emoji picker to avoid SSR issues
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  shortcut?: string;
  type?: "navigation" | "action"; // Add type to differentiate items
}

interface SidebarProps {
  onNavigate?: () => void; // Optional callback for mobile navigation
}

function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: taskCounts, isLoading } = useTaskCounts();
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const createTeamMutation = useCreateTeam();

  // State for create new list functionality
  const [isCreateListExpanded, setIsCreateListExpanded] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🍎");
  const [listName, setListName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Global keyboard event listener for Command+E shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+E (Mac) or Ctrl+E (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleCreateListClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on emoji picker area
      const target = event.target as HTMLElement;
      const isEmojiPickerClick =
        target.closest(".em-emoji-picker") ||
        target.closest("[data-emoji-mart]");

      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        !isEmojiPickerClick
      ) {
        if (isCreateListExpanded) {
          setIsCreateListExpanded(false);
          setListName("");
          setSelectedEmoji("🍎");
          setShowEmojiPicker(false);
        }
      }
    };

    if (isCreateListExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreateListExpanded]);

  // Get dynamic counts
  const homeCount = taskCounts?.counts?.home || 0;
  const todayCount = taskCounts?.counts?.today || 0;
  const teamCounts = taskCounts?.counts?.teams || {};

  console.log("🔍 Sidebar Debug:", {
    taskCounts: taskCounts?.counts,
    homeCount,
    todayCount,
    teamCounts,
    isLoading,
  });

  // Filter teams to exclude Home and Today
  const customTeams =
    teamsData?.teams?.filter(
      (team) => team.name !== "Home" && team.name !== "Today"
    ) || [];

  // Built-in sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <Image
          src="/house.svg"
          alt="Home"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      ),
      href: "/board",
      count: homeCount > 0 ? homeCount : undefined,
      type: "navigation",
    },
    {
      id: "today",
      label: "Today",
      icon: (
        <Image
          src="/calendar.svg"
          alt="Today"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      ),
      href: "/board/today",
      count: todayCount > 0 ? todayCount : undefined,
      type: "navigation",
    },
  ];

  const isActive = (href: string) => {
    // Special case for exact matches
    if (pathname === href) {
      return true;
    }

    // If we're on a team page, only team links should be active
    if (pathname.startsWith("/board/team/")) {
      return href.startsWith("/board/team/") && pathname.startsWith(href + "/");
    }

    // For other pages, check if it starts with the href
    return pathname.startsWith(href + "/");
  };

  const getItemStyles = (item: SidebarItem) => {
    if (item.type === "action") {
      // Action items (Create new list) - lighter grey styling
      return `flex w-full justify-between items-center rounded-lg p-3 transition-all duration-200 hover:bg-neutral-100 group text-neutral-500 hover:text-neutral-600`;
    } else {
      // Navigation items (Home, Today) - darker styling
      return `flex w-full justify-between items-center rounded-lg p-3 transition-all duration-200 hover:bg-neutral-100 group ${
        isActive(item.href)
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-800 hover:text-neutral-900"
      }`;
    }
  };

  const getIconStyles = (item: SidebarItem) => {
    if (item.type === "action") {
      return "text-neutral-400 group-hover:text-neutral-500";
    } else {
      return isActive(item.href)
        ? "text-neutral-900"
        : "text-neutral-700 group-hover:text-neutral-900";
    }
  };

  const getCountStyles = (item: SidebarItem) => {
    if (item.type === "action") {
      return "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600";
    } else {
      return isActive(item.href)
        ? "bg-neutral-200 text-neutral-700"
        : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-700";
    }
  };

  const getShortcutStyles = (item: SidebarItem) => {
    if (item.type === "action") {
      return "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600";
    } else {
      return isActive(item.href)
        ? "bg-neutral-200 text-neutral-700"
        : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-700";
    }
  };

  const handleLinkClick = () => {
    // Call onNavigate when a link is clicked (for mobile menu closing)
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleCreateListClick = () => {
    setIsCreateListExpanded(!isCreateListExpanded);
    if (isCreateListExpanded) {
      // Reset form when closing
      setListName("");
      setSelectedEmoji("🍎");
      setShowEmojiPicker(false);
    } else {
      // Focus input when opening (after animation)
      setTimeout(() => {
        const input = formRef.current?.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      createTeamMutation.mutate(
        {
          name: listName.trim(),
          emoji: selectedEmoji,
        },
        {
          onSuccess: () => {
            // Reset form on success
            setListName("");
            setSelectedEmoji("🍎");
            setIsCreateListExpanded(false);
            setShowEmojiPicker(false);
            // Also call onNavigate to close mobile menu if applicable
            if (onNavigate) {
              onNavigate();
            }
          },
          onError: (error: Error) => {
            // Handle error - you might want to show a toast or error message
            console.error("Failed to create team:", error);
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsCreateListExpanded(false);
      setShowEmojiPicker(false);
      setListName("");
      setSelectedEmoji("🍎");
    } else if (e.key === "Enter" && listName.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full 2xl:w-xl xl:w-lg h-full py-4 lg:py-8 px-3 lg:px-6">
      <div className="w-full h-full bg-white rounded-2xl p-3 lg:p-4 shadow-sm border border-neutral-100">
        <div className="flex flex-col items-start justify-start w-full h-full py-4 lg:py-6 px-4 lg:px-8">
          <div className="w-full space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={getItemStyles(item)}
                onClick={handleLinkClick}
              >
                <div className="flex items-center gap-3">
                  <div className={getIconStyles(item)}>{item.icon}</div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {item.count && (
                  <div
                    className={`rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium ${getCountStyles(
                      item
                    )}`}
                  >
                    {item.count}
                  </div>
                )}
                {item.shortcut && (
                  <div className="flex items-center gap-1">
                    <div
                      className={`rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium ${getShortcutStyles(
                        item
                      )}`}
                    >
                      ⌘
                    </div>
                    <div
                      className={`rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium ${getShortcutStyles(
                        item
                      )}`}
                    >
                      E
                    </div>
                  </div>
                )}
              </Link>
            ))}

            {/* Custom Teams */}
            <AnimatePresence mode="popLayout">
              {customTeams.map((team) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  layout
                >
                  <Link
                    href={`/board/team/${team.id}`}
                    className={`flex w-full justify-between items-center rounded-lg p-3 transition-all duration-200 hover:bg-neutral-100 group ${
                      pathname === `/board/team/${team.id}` ||
                      pathname.startsWith(`/board/team/${team.id}/`)
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-800 hover:text-neutral-900"
                    }`}
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          pathname === `/board/team/${team.id}` ||
                          pathname.startsWith(`/board/team/${team.id}/`)
                            ? "text-neutral-900"
                            : "text-neutral-700 group-hover:text-neutral-900"
                        }`}
                      >
                        <span className="text-lg">{team.emoji || "📋"}</span>
                      </div>
                      <span className="font-semibold text-sm">{team.name}</span>
                    </div>
                    {teamCounts[team.id] > 0 && (
                      <div
                        className={`rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium ${
                          pathname === `/board/team/${team.id}` ||
                          pathname.startsWith(`/board/team/${team.id}/`)
                            ? "bg-neutral-200 text-neutral-700"
                            : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-700"
                        }`}
                      >
                        {teamCounts[team.id]}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Create new list section */}
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                {!isCreateListExpanded ? (
                  <motion.button
                    key="create-button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    onClick={handleCreateListClick}
                    className="flex w-full justify-between items-center rounded-lg p-3 transition-all duration-200 hover:bg-neutral-100 group text-neutral-500 hover:text-neutral-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-neutral-400 group-hover:text-neutral-500">
                        <Image
                          src="/plus.svg"
                          alt="Create new list"
                          width={20}
                          height={20}
                          className="w-4 h-4"
                        />
                      </div>
                      <span className="font-semibold text-sm">
                        Create new list
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600">
                        ⌘
                      </div>
                      <div className="rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600">
                        E
                      </div>
                    </div>
                  </motion.button>
                ) : (
                  <motion.div
                    key="create-form"
                    ref={formRef}
                    initial={{ opacity: 0, scale: 0.95, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: "auto" }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="rounded-lg"
                  >
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-center gap-3">
                        {/* Emoji picker button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm"
                          >
                            <span>{selectedEmoji}</span>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="text-neutral-500"
                            >
                              <path
                                d="M3 4.5L6 7.5L9 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {/* Emoji picker dropdown */}
                          <AnimatePresence>
                            {showEmojiPicker && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                                transition={{
                                  duration: 0.25,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="absolute top-12 left-0 z-[9999] shadow-xl rounded-lg border border-neutral-200 bg-white"
                              >
                                <Picker
                                  data={data}
                                  onEmojiSelect={handleEmojiSelect}
                                  theme="light"
                                  set="native"
                                  previewPosition="none"
                                  skinTonePosition="none"
                                  maxFrequentRows={2}
                                  perLine={8}
                                  emojiSize={20}
                                  emojiButtonSize={32}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* List name input */}
                        <input
                          type="text"
                          value={listName}
                          onChange={(e) => setListName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="List name"
                          className="placeholder:font-medium flex-1 px-3 py-2 rounded-lg border-none focus:outline-none text-sm"
                          autoFocus
                        />
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
