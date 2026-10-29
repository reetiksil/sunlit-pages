"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BookOpen,
  FileText,
  Users,
  Eye,
  Plus,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getAllBooks, deleteBook, upsertBook, getUsers } from "@/services/api";
import { Book } from "@/types";

const ANALYTICS_DATA = [
  { day: "Mon", reads: 3200 },
  { day: "Tue", reads: 3800 },
  { day: "Wed", reads: 4100 },
  { day: "Thu", reads: 3950 },
  { day: "Fri", reads: 4800 },
  { day: "Sat", reads: 5600 },
  { day: "Sun", reads: 6100 },
];

export default function AdminDashboardPage() {
  const { user, toggleRole } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: books = [] } = useQuery({ queryKey: ["books-all"], queryFn: getAllBooks });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const [tab, setTab] = useState<"overview" | "books" | "editor" | "users">("overview");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [chapterTitle, setChapterTitle] = useState("A Quiet Morning in the Valley");

  const editor = useEditor({
    extensions: [StarterKit],
    content:
      "<p>Write or paste your peaceful chapter prose here. All changes stay inside the mock service layer...</p>",
  });

  const removeMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books-all"] }),
  });

  const createMutation = useMutation({
    mutationFn: upsertBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books-all"] });
      setNewTitle("");
      setNewAuthor("");
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-5">
        <ShieldAlert className="mx-auto h-12 w-12 text-primary" />
        <h1 className="font-serif text-2xl font-semibold">Curator Access Required</h1>
        <p className="text-sm text-text-muted">
          The Admin Sanctuary is guarded by role. Click below to switch your mock session role to
          Admin for portfolio evaluation.
        </p>
        <button
          type="button"
          onClick={toggleRole}
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg"
        >
          Switch to Admin Role Now
        </button>
      </div>
    );
  }

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-fluid-h2 font-semibold">Sanctuary Curator Studio</h1>
          <p className="text-sm text-text-muted">
            Manage books, reorder chapters, and publish new stories.
          </p>
        </div>

        <div className="flex rounded-2xl border border-border bg-surface p-1">
          {(["overview", "books", "editor", "users"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize ${
                tab === t ? "bg-primary text-primary-fg" : "text-text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Books", value: books.length, icon: BookOpen },
              { label: "Published Chapters", value: books.length * 12, icon: FileText },
              { label: "Registered Readers", value: users.length, icon: Users },
              { label: "Weekly Peaceful Reads", value: "31.5k", icon: Eye },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface p-5 shadow-calm"
              >
                <stat.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-serif text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-calm">
            <h2 className="font-serif text-lg font-semibold mb-4">Weekly Reading Sessions</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DATA}>
                  <XAxis dataKey="day" stroke="#9AA6BD" fontSize={12} />
                  <YAxis stroke="#9AA6BD" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reads"
                    stroke="#8EC9E8"
                    fill="#8EC9E8"
                    fillOpacity={0.28}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "books" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Quick Create Book Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim() || !newAuthor.trim()) return;
              const created: Book = {
                id: `book-${Date.now()}`,
                slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                title: newTitle,
                author: newAuthor,
                blurb: "Newly added calm story.",
                description: "Newly added calm story.",
                status: "ongoing",
                genres: ["slice-of-life"],
                rating: 4.8,
                views: 100,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                chapterCount: 1,
                coverStyle: {
                  gradientFrom: "#FCE7B2",
                  gradientTo: "#A8DCC3",
                  accentColor: "#2F3B4A",
                  motif: "sun",
                },
              };
              createMutation.mutate(created);
            }}
            className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-calm lg:col-span-4"
          >
            <h2 className="font-serif text-lg font-semibold">Add New Book</h2>
            <input
              type="text"
              required
              placeholder="Book Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Author Name"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-fg"
            >
              <Plus className="h-4 w-4" />
              Create Book
            </button>
          </form>

          {/* Books Data Table */}
          <div className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-calm lg:col-span-8">
            <input
              type="search"
              placeholder="Filter books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-bg px-3.5 text-sm"
            />
            <div className="divide-y divide-border">
              {filteredBooks.slice(0, 8).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-serif font-medium">{b.title}</p>
                    <p className="text-xs text-text-muted">
                      {b.author} · {b.status} · {b.chapterCount} ch
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(b.id)}
                    aria-label={`Delete ${b.title}`}
                    className="rounded-xl p-2 text-text-muted hover:bg-accent-blush/20 hover:text-text"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "editor" && (
        <div className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-calm">
          <h2 className="font-serif text-lg font-semibold">Rich-Text Chapter Editor (Tiptap)</h2>
          <input
            type="text"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-bg px-4 font-serif text-base"
          />
          <div className="min-h-[260px] rounded-2xl border border-border bg-bg p-4 prose max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-calm">
          <h2 className="font-serif text-lg font-semibold mb-4">Registered Community Members</h2>
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
                <span className="rounded-full bg-surface-soft px-3 py-1 text-xs capitalize">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}