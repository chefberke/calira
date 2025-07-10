import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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

  const handleEdit = () => {
    setIsEditSheetOpen(true);
    onEdit?.(id);
  };

  return (
    <>
      <div className="w-full max-w-2xl pt-2.5">
        <div className="group flex items-center justify-between h-14 bg-neutral-100 rounded-2xl border-none px-4 font-medium transition-all duration-300 hover:bg-neutral-100 cursor-pointer">
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
          <div className="w-[520px] h-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col">
            <SheetHeader className="p-0 pb-6">
              <SheetTitle className="text-neutral-900 font-semibold text-lg">
                Edit Task
              </SheetTitle>
              <SheetDescription className="text-neutral-600 text-sm">
                Make changes to your task here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            {/* Sheet içeriği daha sonra eklenecek */}
            <div className="flex-1">
              <p className="text-sm text-neutral-600">
                Task edit form will be implemented here...
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Task;
