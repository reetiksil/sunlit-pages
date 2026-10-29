import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  toggleRole: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: "u-1",
        name: "Clara Reader",
        email: "clara@example.com",
        role: "reader",
        joinedAt: "2025-01-12",
      },
      login: (email, name = "Clara Reader") =>
        set({
          user: {
            id: "u-1",
            name,
            email,
            role: email.includes("admin") ? "admin" : "reader",
            joinedAt: new Date().toISOString().slice(0, 10),
          },
        }),
      logout: () => set({ user: null }),
      toggleRole: () =>
        set((state) => {
          const current = state.user ?? {
            id: "u-1",
            name: "Clara Reader",
            email: "clara@example.com",
            role: "reader" as const,
            joinedAt: "2025-01-12",
          };
          return {
            user: {
              ...current,
              role: current.role === "admin" ? "reader" : "admin",
            },
          };
        }),
    }),
    { name: "sunlit-auth-store" }
  )
);