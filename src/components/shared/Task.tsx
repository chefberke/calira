import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { format } from "date-fns";
import { useUpdateTask, useTeams } from "@/lib/hooks/useTasks";

// VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      position: "absolute",
      border: 0,
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      wordWrap: "normal",
    }}
  >
    {children}
  </span>
);

interface TaskProps {
  id?: string;
  title?: string;
  completed?: boolean;
  dueDate?: string;
  category?: string;
  categoryIcon?: string;
  categoryEmoji?: string;
  description?: string;
  teamId?: number;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function Task({
  id = "1",
  title = "Complete project documentation",
  completed = false,
  dueDate,
  category = "No list",
  categoryIcon = "/mini.svg",
  categoryEmoji,
  description = "",
  teamId,
  onToggleComplete,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskProps) {
  // Helper function to safely parse date
  const parseSafeDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  const [isCompleted, setIsCompleted] = useState(completed);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Edit sheet states
  const [editTitle, setEditTitle] = useState(title);
  const [editCompleted, setEditCompleted] = useState(completed);
  const [editTeamId, setEditTeamId] = useState<string>("no-list");
  const [editDate, setEditDate] = useState<Date | undefined>(
    parseSafeDate(dueDate)
  );
  const [editNotes, setEditNotes] = useState(description || "");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Local category states for immediate UI updates
  const [currentCategory, setCurrentCategory] = useState(category);
  const [currentCategoryIcon, setCurrentCategoryIcon] = useState(categoryIcon);
  const [currentCategoryEmoji, setCurrentCategoryEmoji] =
    useState(categoryEmoji);

  // Hooks
  const updateTaskMutation = useUpdateTask();
  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  const teams = teamsData?.teams || [];

  // Helper function to get team info for category display
  const getTeamDisplayInfo = (teamIdString: string) => {
    if (teamIdString === "no-list") {
      return {
        name: "No list",
        icon: "/mini.svg",
        emoji: undefined,
      };
    }

    const team = teams.find((t) => t.id.toString() === teamIdString);
    if (!team) {
      return {
        name: "No list",
        icon: "/mini.svg",
        emoji: undefined,
      };
    }

    const teamNameLower = team.name.toLowerCase();

    // Today team uses calendar icon
    if (teamNameLower === "today") {
      return {
        name: team.name,
        icon: "/calendar.svg",
        emoji: undefined,
      };
    }

    // Other teams use their emoji or default icon
    return {
      name: team.name,
      icon: team.emoji ? undefined : "/mini.svg",
      emoji: team.emoji,
    };
  };

  // Helper function to get correct team ID for edit
  const getEditTeamId = (taskTeamId?: number): string => {
    if (!taskTeamId) return "no-list";

    const team = teams.find((t) => t.id === taskTeamId);
    if (!team || team.name.toLowerCase() === "home") {
      return "no-list";
    }
    return taskTeamId.toString();
  };

  // Update category display when editTeamId changes
  useEffect(() => {
    const teamInfo = getTeamDisplayInfo(editTeamId);
    setCurrentCategory(teamInfo.name || "No list");
    setCurrentCategoryIcon(teamInfo.icon || "/mini.svg");
    setCurrentCategoryEmoji(teamInfo.emoji || undefined);
  }, [editTeamId, teams]);

  // Initialize edit values when props change
  useEffect(() => {
    setEditTitle(title || "");
    setEditCompleted(completed || false);
    setEditTeamId(getEditTeamId(teamId));
    setEditDate(parseSafeDate(dueDate));
    setEditNotes(description || "");
  }, [title, completed, teamId, dueDate, description, teams]);

  // Initialize category states when props change
  useEffect(() => {
    setCurrentCategory(category || "No list");
    setCurrentCategoryIcon(categoryIcon || "/mini.svg");
    setCurrentCategoryEmoji(categoryEmoji);
  }, [category, categoryIcon, categoryEmoji]);

  const handleEdit = () => {
    setIsEditSheetOpen(true);
    onEdit?.(id);
  };

  // Auto-save changes with real API call
  const handleAutoSave = useCallback(async () => {
    try {
      if (!id || id === "1") return; // Skip for default/demo tasks

      const updateData = {
        id: parseInt(id),
        title: editTitle,
        completed: editCompleted,
        teamId:
          editTeamId && editTeamId !== "no-list"
            ? parseInt(editTeamId)
            : undefined,
        dueDate: editDate?.toISOString(),
        description: editNotes,
      };

      await updateTaskMutation.mutateAsync(updateData);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [
    id,
    editTitle,
    editCompleted,
    editTeamId,
    editDate,
    editNotes,
    updateTaskMutation,
  ]);

  // Update main task state when editCompleted changes
  useEffect(() => {
    if (isEditSheetOpen) {
      setIsCompleted(editCompleted);
    }
  }, [editCompleted, isEditSheetOpen]);

  // Auto-save on changes with shorter debounce
  useEffect(() => {
    if (!isEditSheetOpen) return;

    // Debounced API call
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 300); // Reduced to 300ms for faster response

    return () => clearTimeout(timer);
  }, [handleAutoSave, isEditSheetOpen]);

  return (
    <>
      <div className="w-full max-w-2xl pt-2.5">
        <div className="group flex items-center justify-between h-14 bg-neutral-100 rounded-2xl border-none pl-3 pr-2 font-medium transition-all duration-300 hover:bg-neutral-100 cursor-pointer">
          {/* Left side - Checkbox and Task Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={(checked) => {
                setIsCompleted(checked as boolean);
                onToggleComplete?.(id, checked as boolean);
              }}
              className={`w-5 h-5 border-none bg-neutral-200 data-[state=checked]:bg-neutral-700 shrink-0 transition-all duration-300 ease-out transform ${
                isCompleted ? "scale-110" : "scale-100 hover:scale-105"
              }`}
            />

            <div className="relative">
              <span
                className={`truncate text-sm font-medium transition-all duration-300 ease-out ${
                  isCompleted ? "text-neutral-500" : "text-neutral-800"
                }`}
              >
                {title}
              </span>

              {/* Animated strikethrough line - only covers text */}
              <div
                className={`absolute top-1/2 left-0 h-px bg-neutral-600 transition-all duration-400 ease-out transform -translate-y-1/2 ${
                  isCompleted ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
                style={{
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>

          {/* Right side - Date and Category (hidden on hover) */}
          <div
            className={`flex items-center gap-4 shrink-0 transition-all duration-500 ease-out ${
              isDropdownOpen
                ? "opacity-0 translate-x-2"
                : "group-hover:opacity-0 group-hover:translate-x-2"
            }`}
          >
            {dueDate && (
              <span className="text-sm text-neutral-600 font-medium bg-neutral-200 px-2 py-1 rounded-lg">
                {(() => {
                  try {
                    const date = new Date(dueDate);
                    return isNaN(date.getTime())
                      ? dueDate
                      : date.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        });
                  } catch {
                    return dueDate;
                  }
                })()}
              </span>
            )}
            <div className="flex items-center gap-2">
              {currentCategoryEmoji ? (
                <span className="text-base opacity-60">
                  {currentCategoryEmoji}
                </span>
              ) : (
                <Image
                  src={currentCategoryIcon}
                  alt={currentCategory}
                  width={16}
                  height={16}
                  className="opacity-60"
                />
              )}
            </div>
          </div>

          {/* Dropdown Menu (shown on hover) */}
          <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 flex items-center shrink-0 transition-all duration-500 ease-out">
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-neutral-200 transition-colors duration-200">
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
                  onClick={handleEdit}
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
                  onClick={() => onDuplicate?.(id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <Image
                    src="/copy.svg"
                    alt="Duplicate"
                    width={16}
                    height={16}
                    className="opacity-60"
                  />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(id)}
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
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent
          side="right"
          className="bg-transparent border-0 shadow-none w-auto h-full p-8 flex flex-col [&>button]:hidden outline-none focus:outline-none ring-0 focus:ring-0"
        >
          <div className="w-[520px] h-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col relative">
            {/* Hidden title for accessibility */}
            <VisuallyHidden>
              <SheetTitle>Edit Task</SheetTitle>
            </VisuallyHidden>

            {/* Close Button */}
            <button
              onClick={() => setIsEditSheetOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center"
            >
              <span className="text-neutral-600 text-lg font-normal leading-none">
                ×
              </span>
            </button>

            {/* Task Title with Checkbox */}
            <div className="flex items-center gap-3 mb-6 pr-12">
              <Checkbox
                checked={editCompleted}
                onCheckedChange={(checked) => {
                  const newCompleted = checked as boolean;
                  setEditCompleted(newCompleted);
                  setIsCompleted(newCompleted);
                  // Also trigger the parent callback
                  onToggleComplete?.(id, newCompleted);
                }}
                className="w-5 h-5 border-none bg-neutral-200 data-[state=checked]:bg-neutral-700 shrink-0"
              />
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-medium bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 p-0 h-auto shadow-none"
                placeholder="Task title"
              />
            </div>

            {/* List Selector and Due Date - Side by Side */}
            <div className="flex gap-4 mb-6">
              {/* List Selector */}
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  List
                </label>
                <Select value={editTeamId} onValueChange={setEditTeamId}>
                  <SelectTrigger className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-list">
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
                    {teams
                      .filter((team) => team.name.toLowerCase() !== "home")
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          <div className="flex items-center gap-2">
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="flex-1">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Due Date
                </label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg px-3 flex items-center justify-between text-sm text-left">
                      {editDate && !isNaN(editDate.getTime())
                        ? format(editDate, "PPP")
                        : "Select date"}
                      <Image
                        src="/calendar.svg"
                        alt="Calendar"
                        width={16}
                        height={16}
                        className="opacity-60"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={(date) => {
                        setEditDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notes Section */}
            <div className="flex-1">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Notes
              </label>
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 h-48 transition-colors hover:bg-amber-50 focus-within:bg-amber-50 focus-within:border-amber-300/70">
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-neutral-700 placeholder:text-neutral-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Task;
