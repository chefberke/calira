"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/sign-in",
      });
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Board</h1>
              {session?.user && (
                <p className="text-neutral-600 mt-1">
                  Welcome, {session.user.name || session.user.email}!
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-neutral-600">
            This is your board page. You can test the logout functionality using
            the button above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
