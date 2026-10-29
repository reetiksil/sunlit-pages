import { SEED_BOOKS, SEED_CHAPTERS, GENRES, SEED_USERS } from "@/data/seed";
import { Book, BookFilterParams, Chapter, Genre, User } from "@/types";

// In-memory mutable clone so Admin CRUD operations reflect immediately in the session
let booksStore: Book[] = [...SEED_BOOKS];
const chaptersStore: Record<string, Chapter[]> = { ...SEED_CHAPTERS };

const delay = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms));

export function filterAndSortBooks(books: Book[], filters?: BookFilterParams): Book[] {
  let result = [...books];

  if (filters?.query && filters.query.trim() !== "") {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.blurb.toLowerCase().includes(q)
    );
  }

  if (filters?.genres && filters.genres.length > 0) {
    result = result.filter((b) =>
      filters.genres!.every((g) => b.genres.includes(g))
    );
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((b) => b.status === filters.status);
  }

  const sort = filters?.sort ?? "popular";
  result.sort((a, b) => {
    if (sort === "popular") return b.views - a.views;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sort === "az") return a.title.localeCompare(b.title);
    return 0;
  });

  return result;
}

export async function getBooks(filters?: BookFilterParams): Promise<{
  books: Book[];
  total: number;
}> {
  await delay();
  const filtered = filterAndSortBooks(booksStore, filters);
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  return {
    books: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  await delay(100);
  return [...booksStore];
}

export async function getBook(slug: string): Promise<Book | null> {
  await delay(120);
  return booksStore.find((b) => b.slug === slug) ?? null;
}

export async function getChapters(bookId: string): Promise<Chapter[]> {
  await delay(100);
  return [...(chaptersStore[bookId] ?? [])].sort((a, b) => a.number - b.number);
}

export async function getChapter(bookSlug: string, chapterNumber: number): Promise<{
  book: Book;
  chapter: Chapter;
  totalChapters: number;
} | null> {
  await delay(120);
  const book = booksStore.find((b) => b.slug === bookSlug);
  if (!book) return null;
  const list = chaptersStore[book.id] ?? [];
  const chapter = list.find((c) => c.number === chapterNumber);
  if (!chapter) return null;
  return { book, chapter, totalChapters: list.length };
}

export async function searchBooks(query: string): Promise<Book[]> {
  await delay(90);
  if (!query.trim()) return [];
  return filterAndSortBooks(booksStore, { query }).slice(0, 6);
}

export async function getGenres(): Promise<Genre[]> {
  await delay(60);
  return GENRES;
}

export async function getUsers(): Promise<User[]> {
  await delay(80);
  return SEED_USERS;
}

export async function upsertBook(book: Book): Promise<Book> {
  await delay(150);
  const idx = booksStore.findIndex((b) => b.id === book.id);
  if (idx >= 0) {
    booksStore[idx] = book;
  } else {
    booksStore = [book, ...booksStore];
    chaptersStore[book.id] = [];
  }
  return book;
}

export async function deleteBook(bookId: string): Promise<void> {
  await delay(150);
  booksStore = booksStore.filter((b) => b.id !== bookId);
  delete chaptersStore[bookId];
}

export async function saveChapter(bookId: string, chapter: Chapter): Promise<Chapter> {
  await delay(140);
  const list = chaptersStore[bookId] ?? [];
  const idx = list.findIndex((c) => c.id === chapter.id);
  if (idx >= 0) {
    list[idx] = chapter;
  } else {
    list.push(chapter);
  }
  chaptersStore[bookId] = list;
  return chapter;
}