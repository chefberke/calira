import React, { useState } from "react";
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
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function Task({
  id = "1",
  title = "Complete project documentation",
  completed = false,
  dueDate = "10 Mar",
  category = "No list",
  categoryIcon = "/mini.svg",
  onToggleComplete,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Edit sheet states
  const [editTitle, setEditTitle] = useState(title);
  const [editCompleted, setEditCompleted] = useState(completed);
  const [editList, setEditList] = useState("personal");
  const [editDate, setEditDate] = useState<Date | undefined>(
    dueDate ? new Date() : undefined
  );
  const [editNotes, setEditNotes] = useState(
    "This is a sample note for the task. You can edit this."
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Mock lists data
  const lists = [
    { id: "none", name: "No list" },
    { id: "personal", name: "Personal" },
    { id: "work", name: "Work" },
    { id: "shopping", name: "Shopping" },
  ];

  const handleEdit = () => {
    // Reset edit values to current task values
    setEditTitle(title || "");
    setEditCompleted(completed || false);
    setEditDate(dueDate ? new Date() : undefined);
    setIsEditSheetOpen(true);
    onEdit?.(id);
  };

  // Auto-save changes (simulated)
  const handleAutoSave = () => {
    // Simulate auto-save
    console.log("Auto-saving task:", {
      id,
      title: editTitle,
      completed: editCompleted,
      list: editList,
      dueDate: editDate,
      notes: editNotes,
    });

    // Update main task state
    setIsCompleted(editCompleted);
    // In real app, you would call an API here
  };

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
            <span className="text-sm text-neutral-600 font-medium bg-neutral-200 px-2 py-1 rounded-lg">
              {dueDate}
            </span>
            <div className="flex items-center gap-2">
              <Image
                src={categoryIcon}
                alt={category}
                width={16}
                height={16}
                className="opacity-60"
              />
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
                  setEditCompleted(checked as boolean);
                  // Auto-save on checkbox change
                  setTimeout(handleAutoSave, 100);
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
                <Select value={editList} onValueChange={setEditList}>
                  <SelectTrigger className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg">
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
                      {editDate ? format(editDate, "PPP") : "Select date"}
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-48">
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-neutral-700 placeholder:text-neutral-500"
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
