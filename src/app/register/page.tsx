// src/app/register/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    login(data.email, data.name);
    router.push("/bookshelf");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-calm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl font-semibold">Join the Reading Room</h1>
          <p className="text-xs text-text-muted">
            Create a calm reader profile to save your favorite stories.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold text-text">
              Reader Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Clara Vance"
              {...register("name")}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-text">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="clara@example.com"
              {...register("email")}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-fg shadow-sm hover:brightness-105"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-text underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}