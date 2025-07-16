"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PageTransition from "@/components/shared/PageTransition";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Validation schema
const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

function Page() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError("");
      setSuccess("");

      // Register user via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSuccess("Registration successful! Please sign in manually.");
        reset();
        return;
      }

      // Successful registration and login
      router.push("/board");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");

      await signIn("google", {
        callbackUrl: "/board",
      });
    } catch (error) {
      console.error("Google sign-up error:", error);
      setError("An error occurred during Google sign-up");
    }
  };

  return (
    <PageTransition>
      <div className="bg-neutral-50 h-screen w-full relative overflow-hidden">
        {/* Light Effects */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-ring/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-ring/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-12 items-center justify-center w-full h-full relative z-10">
          <Image src="/logo.svg" alt="logo" width={85} height={85} />
          <div className="bg-white/90 backdrop-blur-sm w-[400px] shadow-lg border border-neutral-100 rounded-3xl">
            <div className="flex flex-col p-10">
              <div className="text-2xl font-semibold text-neutral-950">
                Create an account
              </div>
              <div className="text-sm text-neutral-500 pt-1">
                Create an account to get started.
              </div>

              {error && (
                <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md">
                  {success}
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col pt-5 gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      {...register("email")}
                      placeholder="Email"
                      className={`h-12 bg-neutral-50 border-none font-medium ${
                        errors.email ? "ring-2 ring-red-500" : ""
                      }`}
                      type="email"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      {...register("password")}
                      placeholder="Password"
                      className={`h-12 bg-neutral-50 border-none ${
                        errors.password ? "ring-2 ring-red-500" : ""
                      }`}
                      type="password"
                    />
                    {errors.password && (
                      <span className="text-red-500 text-xs">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      {...register("confirmPassword")}
                      placeholder="Confirm Password"
                      className={`h-12 bg-neutral-50 border-none ${
                        errors.confirmPassword ? "ring-2 ring-red-500" : ""
                      }`}
                      type="password"
                    />
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-xs">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-neutral-950 text-white hover:bg-neutral-950/90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </Button>
                </div>
              </form>

              <div className="flex items-center justify-start pt-4 gap-1">
                <h2 className="text-sm text-neutral-500">
                  Already have an account?
                </h2>
                <Link href="/sign-in">
                  <h2 className="text-sm text-ring/80 hover:text-ring/60 transition-all duration-300">
                    Sign In
                  </h2>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 mt-5">
                <div className="h-[1px] w-full bg-neutral-200"></div>
                <h2 className="text-sm text-neutral-400">Or</h2>
                <div className="h-[1px] w-full bg-neutral-200"></div>
              </div>

              <div className="flex flex-col gap-3 pt-5">
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isSubmitting}
                  className="hover:cursor-pointer w-full h-11 bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src="/google.png"
                    alt="google"
                    width={20}
                    height={20}
                  />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Page;
