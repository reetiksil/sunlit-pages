import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User;
  setRole: (role: "reader" | "admin") => void;
  loginAs: (role: "reader" | "admin") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: "u-reader",
        name: "Clara Vance",
        email: "clara@sunlitpages.dev",
        role: "reader",
        joinedAt: "2025-01-12",
      },
      setRole: (role) =>
        set((state) => ({
          user: {
            ...state.user,
            role,
            name: role === "admin" ? "Julian Thorne (Curator)" : "Clara Vance",
            email: role === "admin" ? "curator@sunlitpages.dev" : "clara@sunlitpages.dev",
          },
        })),
      loginAs: (role) =>
        set({
          user: {
            id: role === "admin" ? "u-admin" : "u-reader",
            name: role === "admin" ? "Julian Thorne (Curator)" : "Clara Vance",
            email: role === "admin" ? "curator@sunlitpages.dev" : "clara@sunlitpages.dev",
            role,
            joinedAt: "2025-01-12",
          },
        }),
      logout: () =>
        set({
          user: {
            id: "u-guest",
            name: "Guest Reader",
            email: "guest@sunlitpages.dev",
            role: "reader",
            joinedAt: "2026-01-01",
          },
        }),
    }),
    { name: "sunlit-auth-storage" }
  )
);