import fs from 'fs';
import path from 'path';

const files = {
  // 1. Config & Styles
  'src/config/site.ts': `export const siteConfig = {
  name: "Sunlit Pages",
  tagline: "A quiet corner for stories, sunlit mornings, and peaceful nights.",
  description: "A minimal, distraction-free online book and light-novel sanctuary with local EPUB & PDF support.",
  url: "https://sunlitpages.example.com",
  maxUploadSizeMB: 25,
  maxUploadSizeBytes: 25 * 1024 * 1024,
  allowedMimeTypes: ["application/epub+zip", "application/pdf"] as const,
  allowedExtensions: [".epub", ".pdf"] as const,
};
export type SiteConfig = typeof siteConfig;`,

  'src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg: #FFF9EF;
    --surface: #FFFFFF;
    --surface-soft: #FDF1DC;
    --primary: #F6B94C;
    --primary-fg: #3B2A0A;
    --accent-sky: #8EC9E8;
    --accent-sky-fg: #163A4F;
    --accent-mint: #A8DCC3;
    --accent-mint-fg: #143D2B;
    --accent-blush: #F7B7A3;
    --accent-blush-fg: #4A1C10;
    --text: #2F3B4A;
    --text-muted: #5C6B7C;
    --border: #F0E6D2;
    --radius: 1rem;
  }

  .dark {
    --bg: #141B2D;
    --surface: #1D2742;
    --surface-soft: #243053;
    --primary: #FFD28A;
    --primary-fg: #1B1405;
    --accent-sky: #7FB5E6;
    --accent-sky-fg: #0D2238;
    --accent-mint: #8FD1B4;
    --accent-mint-fg: #0D291E;
    --accent-blush: #E9A28E;
    --accent-blush-fg: #2E1109;
    --text: #E8ECF5;
    --text-muted: #9AA6BD;
    --border: #2C3859;
  }

  * { border-color: var(--border); }
  html { background-color: var(--bg); color: var(--text); scroll-behavior: smooth; }
}

[data-reader-theme="day"] { --reader-bg: #FFF9EF; --reader-surface: #FFFFFF; --reader-text: #2F3B4A; --reader-border: #F0E6D2; }
[data-reader-theme="sepia"] { --reader-bg: #F4ECD8; --reader-surface: #EFE4C8; --reader-text: #3C2F23; --reader-border: #E2D4B5; }
[data-reader-theme="paper"] { --reader-bg: #FAF8F5; --reader-surface: #F2EFE9; --reader-text: #262625; --reader-border: #E5E0D8; }
[data-reader-theme="night"] { --reader-bg: #141B2D; --reader-surface: #1D2742; --reader-text: #E8ECF5; --reader-border: #2C3859; }
[data-reader-theme="true-dark"] { --reader-bg: #08090C; --reader-surface: #12141A; --reader-text: #D8DEE9; --reader-border: #1E222D; }`,

  // 2. Types
  'src/types/index.ts': `export type BookStatus = "ongoing" | "completed";
export type GenreSlug = "fantasy" | "romance" | "sci-fi" | "slice-of-life" | "mystery" | "adventure" | "historical" | "cozy";

export interface Genre {
  id: string;
  slug: GenreSlug;
  name: string;
  description: string;
  colorToken: "sky" | "mint" | "blush" | "primary";
}

export interface CoverStyle {
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  motif: "sun" | "moon" | "leaf" | "waves" | "stars" | "arch";
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  blurb: string;
  description: string;
  status: BookStatus;
  genres: GenreSlug[];
  rating: number;
  views: number;
  featured?: boolean;
  weeklyRank?: number;
  updatedAt: string;
  createdAt: string;
  chapterCount: number;
  coverStyle: CoverStyle;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string[];
  wordCount: number;
  publishedAt: string;
  status: "published" | "draft";
}

export type ReaderFontFamily = "serif" | "sans" | "dyslexic" | "modern-serif" | "mono";
export type ReaderTheme = "day" | "sepia" | "paper" | "night" | "true-dark";
export type ReaderWidth = "narrow" | "medium" | "wide";

export interface ReaderSettings {
  fontSize: number;
  fontFamily: ReaderFontFamily;
  lineHeight: number;
  paragraphSpacing: number;
  textAlign: "left" | "justify";
  contentWidth: ReaderWidth;
  theme: ReaderTheme;
}

export type ShelfCategory = "reading" | "plan-to-read" | "completed";

export interface ReadingProgress {
  bookId: string;
  bookSlug: string;
  lastChapter: number;
  totalChapters: number;
  scrollPercentage: number;
  readChapters: number[];
  updatedAt: string;
}

export interface UploadedBook {
  id: string;
  title: string;
  author: string;
  format: "epub" | "pdf";
  sizeBytes: number;
  fileBlob: ArrayBuffer;
  progressPercentage: number;
  lastLocation: string;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "reader" | "admin";
  joinedAt: string;
}

export interface BookFilterParams {
  query?: string;
  genres?: GenreSlug[];
  status?: BookStatus | "all";
  sort?: "popular" | "newest" | "rating" | "az";
  page?: number;
  pageSize?: number;
}`,

  // 3. Seed Data
  'src/data/seed.ts': `import { Book, Chapter, Genre, User } from "@/types";

export const GENRES: Genre[] = [
  { id: "g1", slug: "slice-of-life", name: "Slice of Life", description: "Quiet everyday moments and warm tea.", colorToken: "primary" },
  { id: "g2", slug: "fantasy", name: "Fantasy", description: "Soft magic, ancient libraries, and gentle worlds.", colorToken: "sky" },
  { id: "g3", slug: "romance", name: "Romance", description: "Slow-burn connection and heartfelt letters.", colorToken: "blush" },
  { id: "g4", slug: "cozy", name: "Cozy Fiction", description: "Comforting tales with peaceful resolutions.", colorToken: "mint" },
  { id: "g5", slug: "mystery", name: "Mystery", description: "Thoughtful puzzles in sleepy coastal towns.", colorToken: "sky" },
  { id: "g6", slug: "sci-fi", name: "Sci-Fi", description: "Contemplative journeys across quiet stars.", colorToken: "mint" },
  { id: "g7", slug: "adventure", name: "Adventure", description: "Wandering trails and discovery.", colorToken: "primary" },
  { id: "g8", slug: "historical", name: "Historical", description: "Timeless eras brought to life.", colorToken: "blush" },
];

const SEED_DATA: Array<{ title: string; author: string; genres: Book["genres"]; status: Book["status"]; blurb: string; motif: Book["coverStyle"]["motif"]; from: string; to: string; }> = [
  { title: "The Lantern by the Hill", author: "Clara Vance", genres: ["slice-of-life", "cozy"], status: "ongoing", blurb: "An apprentice clockmaker restores a hillside lighthouse that glows when someone needs comfort.", motif: "sun", from: "#FCE7B2", to: "#F7C59F" },
  { title: "Letters to the Greenhouse", author: "Julian Thorne", genres: ["romance", "slice-of-life"], status: "completed", blurb: "Two botanists correspond across continents through pressed wildflowers and letters.", motif: "leaf", from: "#D4F0E2", to: "#A8DCC3" },
  { title: "Cartography of Quiet Seas", author: "Maren Lindqvist", genres: ["adventure", "fantasy"], status: "ongoing", blurb: "Sailing across an archipelago where islands drift with the seasons.", motif: "waves", from: "#D6ECF8", to: "#9BC9E8" },
  { title: "The Baker of Windmill Lane", author: "Hana Takahashi", genres: ["cozy", "slice-of-life"], status: "completed", blurb: "Every loaf of sourdough at the bakery carries a forgotten memory.", motif: "sun", from: "#FDEAC6", to: "#F5C28B" },
  { title: "Observatory of Drifting Stars", author: "Theo Alverez", genres: ["sci-fi", "slice-of-life"], status: "ongoing", blurb: "A lone archivist tends an orbital conservatory listening to gentle radio transmissions.", motif: "stars", from: "#DCE6F7", to: "#B5C9EB" },
  { title: "Anne of Green Gables", author: "L. M. Montgomery", genres: ["slice-of-life", "historical"], status: "completed", blurb: "The classic tale of imaginative Anne Shirley finding her home in Avonlea.", motif: "leaf", from: "#E0F2DF", to: "#B6DFB9" },
  { title: "The Wind in the Willows", author: "Kenneth Grahame", genres: ["cozy", "adventure"], status: "completed", blurb: "Peaceful riverbank afternoons with Mole, Ratty, and Badger along the Thames.", motif: "waves", from: "#D8EFE9", to: "#9ED4C6" },
  { title: "The Secret Garden", author: "Frances Hodgson Burnett", genres: ["historical", "cozy"], status: "completed", blurb: "Behind a locked wall, a neglected Yorkshire garden awakens to sunlight.", motif: "arch", from: "#F9E2DC", to: "#F2B8A7" },
  { title: "Tea at the Paper Moon", author: "Sora Watanabe", genres: ["fantasy", "cozy"], status: "ongoing", blurb: "A nocturnal teahouse brews infusions steeped in starlight.", motif: "moon", from: "#E5E2F9", to: "#C2BBE8" },
  { title: "Whispers in the Bookbindery", author: "Eleanor Finch", genres: ["mystery", "historical"], status: "ongoing", blurb: "When an unsigned manuscript arrives in 1920s Oxford, a bookbinder follows clues.", motif: "arch", from: "#F5E6D3", to: "#E2C5A3" },
  { title: "Summer Train to Kamakura", author: "Renji Sato", genres: ["slice-of-life", "romance"], status: "completed", blurb: "Seven seaside train stops and two commuters sharing an umbrella.", motif: "waves", from: "#D9F0FA", to: "#A3D4EC" },
  { title: "The Apothecary's Almanac", author: "Freya Lind", genres: ["fantasy", "slice-of-life"], status: "ongoing", blurb: "Cataloging alpine herbs and winter remedies in a snow-covered cottage.", motif: "leaf", from: "#DCF2E6", to: "#A7DABF" }
];

export const SEED_BOOKS: Book[] = SEED_DATA.map((item, idx) => {
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: "book-" + (idx + 1),
    slug,
    title: item.title,
    author: item.author,
    blurb: item.blurb,
    description: item.blurb + " Written for unhurried afternoons, " + item.title + " invites readers into a quiet world of contemplative peace.",
    status: item.status,
    genres: item.genres,
    rating: Number((4.6 + ((idx * 3) % 4) * 0.1).toFixed(1)),
    views: 10400 + idx * 2100,
    featured: idx < 4,
    weeklyRank: idx < 6 ? idx + 1 : undefined,
    updatedAt: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    chapterCount: 10,
    coverStyle: { gradientFrom: item.from, gradientTo: item.to, accentColor: "#2F3B4A", motif: item.motif },
  };
});

export const SEED_CHAPTERS: Record<string, Chapter[]> = {};
SEED_BOOKS.forEach((book) => {
  SEED_CHAPTERS[book.id] = Array.from({ length: book.chapterCount }, (_, i) => ({
    id: book.id + "-ch-" + (i + 1),
    bookId: book.id,
    number: i + 1,
    title: i === 0 ? "Sunlight on the Threshold" : "Quiet Pathways, Part " + (i + 1),
    content: [
      "Chapter " + (i + 1) + " begins in the hush of early morning within " + book.title + ".",
      "The morning sunlight slanted across the worn oak floorboards, warming the dust motes that drifted lazily between the bookshelves.",
      "Outside the casement window, the orchard boughs stirred in a breeze scented with clover and early apples.",
      "There was nothing half so pleasant as simply sitting quietly with an uncut volume resting in one's lap while the afternoon drifted past.",
      "As twilight settled over the valley, a single lantern was lit in the window, its warm amber reflection dancing across the pond."
    ],
    wordCount: 1600,
    publishedAt: new Date().toISOString(),
    status: "published",
  }));
});

export const SEED_USERS: User[] = [
  { id: "u-1", name: "Clara Reader", email: "clara@sunlitpages.example.com", role: "reader", joinedAt: "2025-01-12" },
  { id: "u-2", name: "Julian Curator", email: "admin@sunlitpages.example.com", role: "admin", joinedAt: "2024-11-03" }
];`,

  // 4. API Service
  'src/services/api.ts': `import { SEED_BOOKS, SEED_CHAPTERS, GENRES, SEED_USERS } from "@/data/seed";
import { Book, BookFilterParams, Chapter, Genre, User } from "@/types";

let booksStore: Book[] = [...SEED_BOOKS];
let chaptersStore: Record<string, Chapter[]> = { ...SEED_CHAPTERS };
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export function filterAndSortBooks(books: Book[], filters?: BookFilterParams): Book[] {
  let result = [...books];
  if (filters?.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }
  if (filters?.genres?.length) {
    result = result.filter(b => filters.genres!.every(g => b.genres.includes(g)));
  }
  if (filters?.status && filters.status !== "all") {
    result = result.filter(b => b.status === filters.status);
  }
  const sort = filters?.sort ?? "popular";
  result.sort((a, b) => {
    if (sort === "popular") return b.views - a.views;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "az") return a.title.localeCompare(b.title);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  return result;
}

export async function getBooks(filters?: BookFilterParams) {
  await delay();
  const filtered = filterAndSortBooks(booksStore, filters);
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12;
  return { books: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getAllBooks(): Promise<Book[]> {
  await delay(80);
  return [...booksStore];
}

export async function getBook(slug: string): Promise<Book | null> {
  await delay(100);
  return booksStore.find(b => b.slug === slug) ?? null;
}

export async function getChapters(bookId: string): Promise<Chapter[]> {
  await delay(80);
  return [...(chaptersStore[bookId] ?? [])];
}

export async function getChapter(slug: string, n: number) {
  await delay(100);
  const book = booksStore.find(b => b.slug === slug);
  if (!book) return null;
  const list = chaptersStore[book.id] ?? [];
  const chapter = list.find(c => c.number === n);
  if (!chapter) return null;
  return { book, chapter, totalChapters: list.length };
}

export async function searchBooks(query: string): Promise<Book[]> {
  await delay(60);
  if (!query.trim()) return [];
  return filterAndSortBooks(booksStore, { query }).slice(0, 5);
}

export async function getGenres(): Promise<Genre[]> {
  await delay(50);
  return GENRES;
}

export async function getUsers(): Promise<User[]> {
  await delay(60);
  return SEED_USERS;
}

export async function upsertBook(book: Book) {
  await delay(100);
  const idx = booksStore.findIndex(b => b.id === book.id);
  if (idx >= 0) booksStore[idx] = book;
  else { booksStore = [book, ...booksStore]; chaptersStore[book.id] = []; }
  return book;
}

export async function deleteBook(id: string) {
  await delay(100);
  booksStore = booksStore.filter(b => b.id !== id);
  delete chaptersStore[id];
}`,

  // 5. Stores
  'src/stores/useReaderStore.ts': `import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReaderSettings } from "@/types";

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 19,
  fontFamily: "serif",
  lineHeight: 1.8,
  paragraphSpacing: 1.25,
  textAlign: "left",
  contentWidth: "medium",
  theme: "day",
};

interface ReaderStoreState {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}

export const useReaderStore = create<ReaderStoreState>()(
  persist(
    (set) => ({
      settings: DEFAULT_READER_SETTINGS,
      updateSettings: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_READER_SETTINGS }),
    }),
    { name: "sunlit-reader-settings" }
  )
);`,

  'src/stores/useBookshelfStore.ts': `import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReadingProgress, ShelfCategory } from "@/types";

interface BookshelfState {
  shelf: Record<string, ShelfCategory>;
  progress: Record<string, ReadingProgress>;
  setShelfCategory: (bookId: string, category: ShelfCategory | null) => void;
  updateProgress: (data: { bookId: string; bookSlug: string; chapterNumber: number; totalChapters: number; scrollPercentage: number; }) => void;
}

export const useBookshelfStore = create<BookshelfState>()(
  persist(
    (set) => ({
      shelf: { "book-1": "reading" },
      progress: {
        "book-1": {
          bookId: "book-1",
          bookSlug: "the-lantern-by-the-hill",
          lastChapter: 2,
          totalChapters: 10,
          scrollPercentage: 40,
          readChapters: [1, 2],
          updatedAt: new Date().toISOString(),
        },
      },
      setShelfCategory: (bookId, category) =>
        set((s) => {
          const next = { ...s.shelf };
          if (!category) delete next[bookId];
          else next[bookId] = category;
          return { shelf: next };
        }),
      updateProgress: ({ bookId, bookSlug, chapterNumber, totalChapters, scrollPercentage }) =>
        set((s) => ({
          shelf: { ...s.shelf, [bookId]: s.shelf[bookId] ?? "reading" },
          progress: {
            ...s.progress,
            [bookId]: {
              bookId,
              bookSlug,
              lastChapter: chapterNumber,
              totalChapters,
              scrollPercentage,
              readChapters: Array.from(new Set([...(s.progress[bookId]?.readChapters ?? []), chapterNumber])),
              updatedAt: new Date().toISOString(),
            },
          },
        })),
    }),
    { name: "sunlit-bookshelf-store" }
  )
);`,

  'src/stores/useAuthStore.ts': `import { create } from "zustand";
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
      user: { id: "u-1", name: "Clara Reader", email: "clara@sunlitpages.example.com", role: "reader", joinedAt: "2025-01-12" },
      login: (email, name = "Clara Reader") =>
        set({ user: { id: "u-1", name, email, role: email.includes("admin") ? "admin" : "reader", joinedAt: new Date().toISOString().slice(0, 10) } }),
      logout: () => set({ user: null }),
      toggleRole: () =>
        set((s) => ({
          user: s.user ? { ...s.user, role: s.user.role === "admin" ? "reader" : "admin" } : null,
        })),
    }),
    { name: "sunlit-auth-store" }
  )
);`,

  // 6. Libs
  'src/lib/db.ts': `import Dexie, { type EntityTable } from "dexie";
import { UploadedBook } from "@/types";

const db = new Dexie("SunlitPagesLocalDB") as Dexie & {
  uploadedBooks: EntityTable<UploadedBook, "id">;
};

db.version(1).stores({ uploadedBooks: "id, title, format, addedAt" });
export { db };`,

  'src/lib/validations.ts': `import { z } from "zod";
import { siteConfig } from "@/config/site";

export const uploadFileSchema = z.object({
  name: z.string().refine(name => name.toLowerCase().endsWith(".epub") || name.toLowerCase().endsWith(".pdf"), "Please select an .epub or .pdf book file."),
  size: z.number().positive().max(siteConfig.maxUploadSizeBytes, "File exceeds " + siteConfig.maxUploadSizeMB + " MB limit."),
});

export function validateBookFile(file: { name: string; size: number }) {
  return uploadFileSchema.safeParse(file);
}`,

  // 7. Components
  'src/components/background/AmbientBackground.tsx': `"use client";
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

export function AmbientBackground() {
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <motion.div
        animate={!shouldReduceMotion ? { x: [0, 30, -20, 0], y: [0, -20, 15, 0] } : false}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-35 blur-3xl"
        style={{ background: isDark ? "radial-gradient(circle, rgba(255, 210, 138, 0.15) 0%, transparent 70%)" : "radial-gradient(circle, rgba(246, 185, 76, 0.25) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={!shouldReduceMotion ? { x: [0, -40, 20, 0], y: [0, 25, -20, 0] } : false}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-28 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: isDark ? "radial-gradient(circle, rgba(127, 181, 230, 0.15) 0%, transparent 70%)" : "radial-gradient(circle, rgba(142, 201, 232, 0.25) 0%, transparent 70%)" }}
      />
    </div>
  );
}`,

  'src/components/layout/ThemeToggle.tsx': `"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-10 rounded-full bg-surface-soft" />;
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-text hover:bg-primary/25"
    >
      {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-600" />}
    </button>
  );
}`,

  'src/components/book/SvgCover.tsx': `import React from "react";
import { CoverStyle } from "@/types";

export function SvgCover({ title, author, styleConfig }: { title: string; author: string; styleConfig: CoverStyle }) {
  const { gradientFrom, gradientTo, accentColor, motif } = styleConfig;
  const gradId = "grad-" + title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-calm select-none">
      <svg viewBox="0 0 300 450" className="h-full w-full object-cover">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill={"url(#" + gradId + ")"} />
        <rect x="18" y="18" width="264" height="414" rx="12" fill="none" stroke={accentColor} strokeOpacity="0.3" strokeWidth="1.5" />
        {motif === "sun" && <circle cx="150" cy="150" r="44" fill={accentColor} fillOpacity="0.25" />}
        {motif === "moon" && <path d="M165 115 A45 45 0 1 0 195 185 A38 38 0 1 1 165 115 Z" fill={accentColor} fillOpacity="0.25" />}
        {motif === "leaf" && <path d="M150 105 C190 130 190 180 150 210 C110 180 110 130 150 105 Z" fill={accentColor} fillOpacity="0.25" />}
        {motif === "waves" && <path d="M40 175 Q95 145 150 175 T260 175" fill="none" stroke={accentColor} strokeWidth="5" strokeOpacity="0.3" strokeLinecap="round" />}
      </svg>
      <div className="absolute inset-0 flex flex-col justify-between p-5 text-center">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-stone-700/70">Sunlit Edition</span>
        <div className="my-auto pt-14">
          <h3 className="font-serif text-base font-semibold text-stone-900 line-clamp-3">{title}</h3>
          <p className="mt-1 text-xs text-stone-700/80">{author}</p>
        </div>
        <div className="mx-auto h-1 w-6 rounded-full bg-stone-900/20" />
      </div>
    </div>
  );
}`,

  'src/components/book/BookCard.tsx': `"use client";
import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Book } from "@/types";
import { SvgCover } from "./SvgCover";

export function BookCard({ book, rank }: { book: Book; rank?: number }) {
  return (
    <Link href={"/book/" + book.slug} className="group relative flex flex-col rounded-2xl p-2 transition-transform duration-300 hover:-translate-y-1">
      {rank !== undefined && (
        <span className="absolute left-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-fg shadow-sm">
          {rank}
        </span>
      )}
      <div className="overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]">
        <SvgCover title={book.title} author={book.author} styleConfig={book.coverStyle} />
      </div>
      <div className="mt-2.5 space-y-0.5 px-1">
        <h3 className="font-serif text-sm font-semibold text-text truncate group-hover:text-primary">{book.title}</h3>
        <p className="text-xs text-text-muted truncate">{book.author}</p>
        <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-text-muted">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span>{book.rating}</span>
          <span>·</span>
          <span className="capitalize">{book.status}</span>
        </div>
      </div>
    </Link>
  );
}`,

  'src/components/layout/Header.tsx': `"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, UserCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const { user, toggleRole } = useAuthStore();
  if (pathname.includes("/chapter/")) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-semibold text-text">{siteConfig.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-text-muted">
          <Link href="/" className="px-3 py-1.5 rounded-lg hover:text-text hover:bg-surface-soft">Home</Link>
          <Link href="/browse" className="px-3 py-1.5 rounded-lg hover:text-text hover:bg-surface-soft">Browse</Link>
          <Link href="/bookshelf" className="px-3 py-1.5 rounded-lg hover:text-text hover:bg-surface-soft">Bookshelf</Link>
          <Link href="/read-your-own" className="px-3 py-1.5 rounded-lg hover:text-text hover:bg-surface-soft">Upload & Read</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-1 rounded-lg bg-accent-sky/20 px-3 py-1.5 text-text">
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleRole}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted hover:bg-surface-soft"
          >
            <UserCheck className="h-3 w-3 text-primary" />
            Role: <strong className="capitalize text-text">{user?.role ?? "reader"}</strong>
          </button>
        </div>
      </div>
    </header>
  );
}`,

  'src/components/layout/Footer.tsx': `import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/50 py-10 text-xs text-text-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div>
          <p className="font-serif text-sm font-semibold text-text">{siteConfig.name}</p>
          <p>{siteConfig.tagline}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/browse" className="hover:text-text">Browse</Link>
          <Link href="/bookshelf" className="hover:text-text">Bookshelf</Link>
          <Link href="/read-your-own" className="hover:text-text">Upload</Link>
          <Link href="/admin" className="hover:text-text">Curator Studio</Link>
        </div>
      </div>
    </footer>
  );
}`,

  'src/components/layout/Providers.tsx': `"use client";
import React, { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60000 } } }));
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}`,

  'src/components/reader/ReaderSettingsDrawer.tsx': `"use client";
import React from "react";
import { RotateCcw, X } from "lucide-react";
import { useReaderStore } from "@/stores/useReaderStore";

export function ReaderSettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings, resetSettings } = useReaderStore();
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-calm sm:inset-auto sm:right-6 sm:top-20 sm:w-80 sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-serif text-base font-semibold text-text">Preferences</h3>
        <button onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs uppercase text-text-muted">Theme</label>
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {(["day", "sepia", "paper", "night", "true-dark"] as const).map(t => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={"h-8 rounded-lg text-xs capitalize border " + (settings.theme === t ? "border-primary font-bold" : "border-border")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>Font Size</span><span>{settings.fontSize}px</span>
          </div>
          <input
            type="range" min={14} max={30} value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <button
          onClick={resetSettings}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-soft text-xs"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}`,

  // 8. Pages
  'src/app/layout.tsx': `import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/background/AmbientBackground";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: "%s | " + siteConfig.name },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fraunces.variable + " " + sans.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Providers>
          <AmbientBackground />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}`,

  'src/app/page.tsx': `"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { getAllBooks, getGenres } from "@/services/api";
import { SvgCover } from "@/components/book/SvgCover";
import { BookCard } from "@/components/book/BookCard";

export default function HomePage() {
  const { data: books = [] } = useQuery({ queryKey: ["books-all"], queryFn: getAllBooks });
  const { data: genres = [] } = useQuery({ queryKey: ["genres"], queryFn: getGenres });
  const featured = books[0];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      {featured && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-calm">
          <div className="mx-auto w-44 md:col-span-4">
            <SvgCover title={featured.title} author={featured.author} styleConfig={featured.coverStyle} />
          </div>
          <div className="space-y-4 md:col-span-8 text-center md:text-left">
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-text">Featured Pick</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-text">{featured.title}</h1>
            <p className="text-sm text-text-muted">By {featured.author}</p>
            <p className="text-sm max-w-xl text-text-muted">{featured.blurb}</p>
            <Link href={"/book/" + featured.slug + "/chapter/1"} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg">
              <BookOpen className="h-4 w-4" /> Start Reading
            </Link>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">Moods & Genres</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {genres.map(g => (
            <Link key={g.id} href={"/browse?genre=" + g.slug} className="rounded-2xl border border-border bg-surface p-3 text-center text-xs font-medium hover:bg-surface-soft">
              {g.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">Popular This Week</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {books.slice(0, 6).map((b, i) => (
            <BookCard key={b.id} book={b} rank={i + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}`,

  'src/app/browse/page.tsx': `"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "@/services/api";
import { BookCard } from "@/components/book/BookCard";

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const { data } = useQuery({
    queryKey: ["browse-books", query],
    queryFn: () => getBooks({ query, pageSize: 24 }),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold">Browse Library</h1>
      <input
        type="search"
        placeholder="Search books..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10 w-full max-w-sm rounded-xl border border-border bg-surface px-3 text-sm"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data?.books.map(b => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
}`,

  'src/app/book/[slug]/page.tsx': `"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { getBook, getChapters } from "@/services/api";
import { SvgCover } from "@/components/book/SvgCover";

export default function BookDetailPage() {
  const params = useParams<{ slug: string }>();
  const { data: book } = useQuery({ queryKey: ["book", params.slug], queryFn: () => getBook(params.slug) });
  const { data: chapters = [] } = useQuery({
    queryKey: ["chapters", book?.id],
    enabled: !!book?.id,
    queryFn: () => getChapters(book!.id),
  });

  if (!book) return <div className="p-8 text-center text-sm">Loading book details...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="mx-auto w-48 md:col-span-4">
          <SvgCover title={book.title} author={book.author} styleConfig={book.coverStyle} />
        </div>
        <div className="space-y-4 md:col-span-8">
          <h1 className="font-serif text-3xl font-semibold text-text">{book.title}</h1>
          <p className="text-sm text-text-muted">By {book.author}</p>
          <p className="text-sm text-text-muted leading-relaxed">{book.description}</p>
          <Link href={"/book/" + book.slug + "/chapter/1"} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg">
            <BookOpen className="h-4 w-4" /> Start Reading
          </Link>
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-xl font-semibold mb-4">Chapters ({chapters.length})</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {chapters.map(c => (
            <Link key={c.id} href={"/book/" + book.slug + "/chapter/" + c.number} className="flex justify-between p-3.5 text-sm hover:bg-surface-soft">
              <span>Chapter {c.number}: {c.title}</span>
              <span className="text-xs text-text-muted">{c.wordCount} words</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  'src/app/book/[slug]/chapter/[n]/page.tsx': `"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { getChapter } from "@/services/api";
import { useReaderStore } from "@/stores/useReaderStore";
import { ReaderSettingsDrawer } from "@/components/reader/ReaderSettingsDrawer";

export default function ChapterReaderPage() {
  const params = useParams<{ slug: string; n: string }>();
  const router = useRouter();
  const chapterNumber = Number(params.n) || 1;
  const { settings } = useReaderStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["chapter", params.slug, chapterNumber],
    queryFn: () => getChapter(params.slug, chapterNumber),
  });

  return (
    <div data-reader-theme={settings.theme} className="min-h-screen" style={{ backgroundColor: "var(--reader-bg)", color: "var(--reader-text)" }}>
      <header className="sticky top-0 z-40 border-b border-border/50 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href={"/book/" + params.slug} className="p-2"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="text-center truncate">
            <p className="text-xs opacity-70">{data?.book.title}</p>
            <p className="font-serif text-sm font-semibold truncate">Ch. {chapterNumber}: {data?.chapter.title}</p>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2"><Settings2 className="h-5 w-5" /></button>
        </div>
      </header>
      <article className="mx-auto max-w-prose px-4 py-12" style={{ fontSize: settings.fontSize + "px", lineHeight: settings.lineHeight }}>
        <h1 className="font-serif text-2xl font-bold mb-6">{data?.chapter.title}</h1>
        {data?.chapter.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        <div className="mt-12 flex justify-between border-t border-border pt-6 text-sm">
          <button
            disabled={chapterNumber <= 1}
            onClick={() => router.push("/book/" + params.slug + "/chapter/" + (chapterNumber - 1))}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            disabled={!data || chapterNumber >= data.totalChapters}
            onClick={() => router.push("/book/" + params.slug + "/chapter/" + (chapterNumber + 1))}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </article>
      <ReaderSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}`,

  'src/app/read-your-own/page.tsx': `"use client";
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { UploadCloud, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { validateBookFile } from "@/lib/validations";

export default function ReadYourOwnPage() {
  const books = useLiveQuery(() => db.uploadedBooks.toArray(), []) ?? [];
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File | null) => {
    setError(null);
    if (!file) return;
    const v = validateBookFile({ name: file.name, size: file.size });
    if (!v.success) return setError(v.error.issues[0].message);

    const buffer = await file.arrayBuffer();
    await db.uploadedBooks.add({
      id: "local-" + Date.now(),
      title: file.name.replace(/\.(epub|pdf)$/i, ""),
      author: "Local File",
      format: file.name.endsWith(".epub") ? "epub" : "pdf",
      sizeBytes: file.size,
      fileBlob: buffer,
      progressPercentage: 0,
      lastLocation: "1",
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold">Upload & Read Locally</h1>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface p-10 text-center hover:bg-surface-soft">
        <UploadCloud className="h-10 w-10 text-primary" />
        <span className="mt-2 text-sm font-semibold">Drop an .epub or .pdf here (up to 25 MB)</span>
        <input type="file" accept=".epub,.pdf" onChange={(e) => handleUpload(e.target.files?.[0] ?? null)} className="sr-only" />
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-semibold">Your Browser Library ({books.length})</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {books.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium text-sm">{b.title}</p><p className="text-xs text-text-muted capitalize">{b.format}</p></div>
              <button onClick={() => db.uploadedBooks.delete(b.id)}><Trash2 className="h-4 w-4 text-text-muted" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  'src/app/bookshelf/page.tsx': `"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookshelfStore } from "@/stores/useBookshelfStore";
import { getAllBooks } from "@/services/api";
import { BookCard } from "@/components/book/BookCard";

export default function BookshelfPage() {
  const { shelf } = useBookshelfStore();
  const { data: books = [] } = useQuery({ queryKey: ["books-all"], queryFn: getAllBooks });
  const savedBooks = books.filter(b => shelf[b.id]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold">My Bookshelf</h1>
      {savedBooks.length === 0 ? (
        <p className="text-sm text-text-muted">No books saved yet. Browse and add books to your shelf!</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {savedBooks.map(b => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}`,

  'src/app/admin/page.tsx': `"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { getAllBooks, deleteBook, upsertBook } from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: books = [] } = useQuery({ queryKey: ["books-all"], queryFn: getAllBooks });
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const deleteMut = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books-all"] }),
  });

  const createMut = useMutation({
    mutationFn: upsertBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books-all"] });
      setTitle(""); setAuthor("");
    },
  });

  if (user?.role !== "admin") return <div className="p-12 text-center text-sm">Admin access required. Use the role switcher in the header to switch to admin.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold">Curator Studio</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !author.trim()) return;
        createMut.mutate({
          id: "book-" + Date.now(),
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title, author, blurb: "A new story.", description: "Description.",
          status: "ongoing", genres: ["slice-of-life"], rating: 4.8, views: 10,
          updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
          chapterCount: 1, coverStyle: { gradientFrom: "#FCE7B2", gradientTo: "#A8DCC3", accentColor: "#2F3B4A", motif: "sun" }
        });
      }} className="flex gap-2">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="h-10 rounded-xl border border-border px-3 text-sm" />
        <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} className="h-10 rounded-xl border border-border px-3 text-sm" />
        <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-fg">Add Book</button>
      </form>
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {books.map(b => (
          <div key={b.id} className="flex justify-between items-center p-3 text-sm">
            <span>{b.title} ({b.author})</span>
            <button onClick={() => deleteMut.mutate(b.id)}><Trash2 className="h-4 w-4 text-text-muted" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'src/app/login/page.tsx': `"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <form onSubmit={(e) => { e.preventDefault(); login(email || "reader@sunlitpages.example.com"); router.push("/"); }} className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-calm">
        <h1 className="font-serif text-xl font-semibold">Sign In</h1>
        <p className="text-xs text-text-muted">Enter any email to sign in to the demo.</p>
        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-10 w-full rounded-xl border border-border px-3 text-sm" />
        <button type="submit" className="h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-fg">Continue</button>
      </form>
    </div>
  );
}`
};

console.log("Writing project files...");
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log("  [OK] " + filePath);
}
console.log("\nAll project files generated successfully!");