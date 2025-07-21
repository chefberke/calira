"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useTaskCounts,
  useCreateTeam,
  useTeams,
  useUpdateTeam,
  useDeleteTeam,
} from "@/lib/hooks/useTasks";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// Type for emoji selection
interface EmojiData {
  native: string;
}

function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: taskCounts } = useTaskCounts();
  const { data: teamsData } = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  // State for create new list functionality
  const [isCreateListExpanded, setIsCreateListExpanded] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🍎");
  const [listName, setListName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // State for edit team functionality
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [editingTeamEmoji, setEditingTeamEmoji] = useState("🍎");
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const editFormRef = useRef<HTMLDivElement>(null);

  // Filter teams to exclude Home and Today
  const customTeams =
    teamsData?.teams?.filter(
      (team) => team.name !== "Home" && team.name !== "Today"
    ) || [];

  const handleCreateListClick = useCallback(() => {
    // Check if user has reached the limit of 10 teams
    if (customTeams.length >= 10) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000); // Hide warning after 3 seconds
      return;
    }

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
  }, [isCreateListExpanded, customTeams.length]);

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
  }, [handleCreateListClick]);

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

      // Handle edit form click outside
      if (
        editFormRef.current &&
        !editFormRef.current.contains(event.target as Node) &&
        !isEmojiPickerClick
      ) {
        if (editingTeamId !== null) {
          setEditingTeamId(null);
          setEditingTeamName("");
          setEditingTeamEmoji("🍎");
          setShowEditEmojiPicker(false);
        }
      }
    };

    if (isCreateListExpanded || editingTeamId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreateListExpanded, editingTeamId]);

  // Get dynamic counts
  const homeCount = taskCounts?.counts?.home || 0;
  const todayCount = taskCounts?.counts?.today || 0;
  const teamCounts = taskCounts?.counts?.teams || {};

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
          className="w-6 h-6"
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
          className="w-6 h-6"
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

    // For /board (Home), only activate if we're exactly on /board
    if (href === "/board") {
      return pathname === "/board";
    }

    // For other pages, check if it starts with the href
    return pathname.startsWith(href + "/");
  };

  const getItemStyles = (item: SidebarItem) => {
    if (item.type === "action") {
      // Action items (Create new list) - lighter grey styling
      return `flex w-full justify-between items-center rounded-lg p-3 h-12 transition-all duration-200 hover:bg-neutral-100 group text-neutral-500 hover:text-neutral-600`;
    } else {
      // Navigation items (Home, Today) - darker styling
      return `flex w-full justify-between items-center rounded-lg p-3 h-12 transition-all duration-200 hover:bg-neutral-100 group ${
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

  const handleEmojiSelect = (emoji: EmojiData) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiPicker(false);
  };

  const handleEditEmojiSelect = (emoji: EmojiData) => {
    setEditingTeamEmoji(emoji.native);
    setShowEditEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has reached the limit of 10 teams
    if (customTeams.length >= 10) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }

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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTeamName.trim() && editingTeamId !== null) {
      updateTeamMutation.mutate(
        {
          id: editingTeamId,
          name: editingTeamName.trim(),
          emoji: editingTeamEmoji,
        },
        {
          onSuccess: () => {
            // Reset form on success
            setEditingTeamId(null);
            setEditingTeamName("");
            setEditingTeamEmoji("🍎");
            setShowEditEmojiPicker(false);
          },
          onError: (error: Error) => {
            console.error("Failed to update team:", error);
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
      handleSubmit(e);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditingTeamId(null);
      setEditingTeamName("");
      setEditingTeamEmoji("🍎");
      setShowEditEmojiPicker(false);
    } else if (e.key === "Enter" && editingTeamName.trim()) {
      e.preventDefault();
      handleEditSubmit(e);
    }
  };

  const handleEditItem = (itemId: string) => {
    const teamId = parseInt(itemId);
    const team = customTeams.find((t) => t.id === teamId);

    if (team) {
      setEditingTeamId(teamId);
      setEditingTeamName(team.name);
      setEditingTeamEmoji(team.emoji || "📋");
      setShowEditEmojiPicker(false);

      // Focus input after animation
      setTimeout(() => {
        const input = editFormRef.current?.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const teamId = parseInt(itemId);

    // Check if we're currently on the team page that's being deleted
    const isOnTeamPage =
      pathname === `/board/team/${teamId}` ||
      pathname.startsWith(`/board/team/${teamId}/`);

    deleteTeamMutation.mutate(teamId, {
      onSuccess: () => {
        // If we were on the deleted team's page, redirect to home
        if (isOnTeamPage) {
          router.push("/board");
        } else {
          // If we're on another team's page, check if that team still exists
          const currentTeamMatch = pathname.match(/^\/board\/team\/(\d+)/);
          if (currentTeamMatch) {
            const currentTeamId = parseInt(currentTeamMatch[1]);

            // After successful deletion, check if the current team still exists
            // We need a slight delay to ensure the cache is updated
            setTimeout(() => {
              const stillExists = customTeams.some(
                (team) => team.id === currentTeamId
              );

              if (!stillExists) {
                router.push("/board");
              }
            }, 200);
          }
        }
      },
      onError: (error: Error) => {
        console.error("Failed to delete team:", error);
      },
    });
  };

  return (
    <div className="w-full 2xl:w-xl xl:w-md lg:w-md h-full py-4 lg:py-8 px-3 lg:px-6">
      <div className="w-full h-full bg-white rounded-2xl p-3 lg:p-4 shadow-sm border border-neutral-100">
        <div className="flex flex-col items-start justify-start w-full h-full py-4 lg:py-6 px-4 lg:px-8">
          <div className="w-full space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={getItemStyles(item)}
                onClick={handleLinkClick}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={getIconStyles(item)}>{item.icon}</div>
                  <span className="font-semibold text-sm truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Only show more options for custom items (not Home/Today) */}
                  {item.id !== "home" && item.id !== "today" && (
                    <div className="flex items-center justify-center w-8 h-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`p-1 rounded-md hover:bg-neutral-200 transition-all duration-200 ${
                              hoveredItem === item.id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          >
                            <Image
                              src="/more.svg"
                              alt="More options"
                              width={20}
                              height={20}
                              className="opacity-60 hover:opacity-100 transition-opacity duration-200"
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 bg-white border border-neutral-200 shadow-lg rounded-xl p-1"
                          sideOffset={8}
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditItem(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors duration-200"
                          >
                            <Image
                              src="/edit.svg"
                              alt="Edit"
                              width={16}
                              height={16}
                              className="opacity-60"
                            />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors duration-200"
                          >
                            <Image
                              src="/trash.svg"
                              alt="Delete"
                              width={16}
                              height={16}
                              className="opacity-60"
                            />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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
                </div>
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
                  {editingTeamId === team.id ? (
                    /* Edit Form */
                    <motion.div
                      ref={editFormRef}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="rounded-lg"
                    >
                      <form onSubmit={handleEditSubmit}>
                        <div className="flex items-center gap-3">
                          {/* Emoji picker button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowEditEmojiPicker(!showEditEmojiPicker)
                              }
                              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                            >
                              <span>{editingTeamEmoji}</span>
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
                              {showEditEmojiPicker && (
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
                                    onEmojiSelect={handleEditEmojiSelect}
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

                          {/* Team name input */}
                          <input
                            type="text"
                            value={editingTeamName}
                            onChange={(e) => setEditingTeamName(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            placeholder="Team name"
                            maxLength={50}
                            className="placeholder:font-medium flex-1 px-3 py-2 rounded-lg border-none focus:outline-none text-sm"
                            autoFocus
                          />
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    /* Normal Team Link */
                    <Link
                      href={`/board/team/${team.id}`}
                      className={`flex w-full justify-between items-center rounded-lg p-3 h-12 transition-all duration-200 hover:bg-neutral-100 group ${
                        pathname === `/board/team/${team.id}` ||
                        pathname.startsWith(`/board/team/${team.id}/`)
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-800 hover:text-neutral-900"
                      }`}
                      onClick={handleLinkClick}
                      onMouseEnter={() => setHoveredItem(team.id.toString())}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`${
                            pathname === `/board/team/${team.id}` ||
                            pathname.startsWith(`/board/team/${team.id}/`)
                              ? "text-neutral-900"
                              : "text-neutral-700 group-hover:text-neutral-900"
                          }`}
                        >
                          <span className="text-xl">{team.emoji || "📋"}</span>
                        </div>
                        <span className="font-semibold text-sm truncate">
                          {team.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`p-1 rounded-md hover:bg-neutral-200 transition-all duration-200 ${
                                  hoveredItem === team.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                <Image
                                  src="/more.svg"
                                  alt="More options"
                                  width={20}
                                  height={20}
                                  className="opacity-60 hover:opacity-100 transition-opacity duration-200"
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 bg-white border border-neutral-200 shadow-lg rounded-xl p-1"
                              sideOffset={8}
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditItem(team.id.toString())
                                }
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors duration-200"
                              >
                                <Image
                                  src="/edit.svg"
                                  alt="Edit"
                                  width={16}
                                  height={16}
                                  className="opacity-60"
                                />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteItem(team.id.toString())
                                }
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors duration-200"
                              >
                                <Image
                                  src="/trash.svg"
                                  alt="Delete"
                                  width={16}
                                  height={16}
                                  className="opacity-60"
                                />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Create new list section */}
            <div className="space-y-2">
              {/* Show warning message */}
              <AnimatePresence>
                {showLimitWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 text-sm"
                  >
                    Maximum 10 lists allowed. Delete an existing list first.
                  </motion.div>
                )}
              </AnimatePresence>

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
                    className="flex w-full justify-between items-center rounded-lg p-3 h-12 transition-all duration-200 hover:bg-neutral-100 group text-neutral-500 hover:text-neutral-600"
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Emoji picker button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
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
                            maxLength={50}
                            className="placeholder:font-medium flex-1 px-3 py-2 rounded-lg border-none focus:outline-none text-sm"
                            autoFocus
                          />
                        </div>

                        {/* Enter key indicator */}
                        <div className="rounded-md flex items-center justify-center py-1 px-2 text-xs font-medium bg-neutral-100 text-neutral-500">
                          ↵
                        </div>
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
