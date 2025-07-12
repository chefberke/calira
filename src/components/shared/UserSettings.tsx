"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

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

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  provider: "google" | "credentials";
  taskCount: number;
}

const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch("/api/user/me");
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

const UserAvatar = ({ user }: { user: UserData }) => {
  if (user.provider === "google" && user.image) {
    return (
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
        <Image
          src={user.image}
          alt={user.name || "User"}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Show first letter of email for credentials users
  const firstLetter = user.email.charAt(0).toUpperCase();
  return (
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-2xl font-medium text-gray-700">{firstLetter}</span>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

interface UserSettingsProps {
  children: React.ReactNode;
}

export default function UserSettings({ children }: UserSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-data"],
    queryFn: fetchUserData,
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  if (isLoading) {
    return <Sheet>{children}</Sheet>;
  }

  if (error || !userData) {
    return <Sheet>{children}</Sheet>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="bg-transparent border-0 shadow-none w-auto h-full p-8 flex flex-col [&>button]:hidden outline-none focus:outline-none ring-0 focus:ring-0"
        side="right"
      >
        <div className="w-[600px] h-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col relative">
          {/* Hidden title for accessibility */}
          <VisuallyHidden>
            <SheetTitle>Settings</SheetTitle>
          </VisuallyHidden>

          {/* Custom Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center"
          >
            <span className="text-neutral-600 text-lg font-normal leading-none">
              ×
            </span>
          </button>

          {/* Header */}
          <div className="mb-8 pr-12">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Settings
            </h2>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4 mb-8 p-4 bg-neutral-50 rounded-xl">
            <UserAvatar user={userData} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                {userData.name || "User"}
              </h3>
              <p className="text-sm text-neutral-600">{userData.email}</p>
            </div>
          </div>

          {/* User Stats Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              Account Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 px-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium text-neutral-700">
                  Member since
                </span>
                <span className="text-sm text-neutral-900 font-medium">
                  {formatDate(userData.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 px-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium text-neutral-700">
                  Tasks created
                </span>
                <span className="text-sm text-neutral-900 font-medium">
                  {userData.taskCount}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 px-4 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium text-neutral-700">
                  Account type
                </span>
                <span className="text-sm text-neutral-900 font-medium">
                  {userData.provider === "google" ? "Google" : "Email"}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-auto pt-6 border-t border-neutral-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 justify-center text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
            >
              Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
