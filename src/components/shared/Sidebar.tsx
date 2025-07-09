"use client";

import React from "react";
import { Home, Clock, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  shortcut?: string;
  type?: "navigation" | "action"; // Add type to differentiate items
}

function Sidebar() {
  const pathname = usePathname();

  // Built-in sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <Home size={20} />,
      href: "/board",
      count: 6,
      type: "navigation",
    },
    {
      id: "today",
      label: "Today",
      icon: <Clock size={20} />,
      href: "/board/today",
      count: 3,
      type: "navigation",
    },
    {
      id: "create-list",
      label: "Create new list",
      icon: <Plus size={16} />,
      href: "/board/create",
      shortcut: "⌘E",
      type: "action",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
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

  return (
    <div className="w-xl h-full p-4">
      <div className="w-full h-full bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
        <div className="flex flex-col items-start justify-start w-full h-full py-6 px-2">
          <div className="w-full space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={getItemStyles(item)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
