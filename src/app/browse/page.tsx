"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import { getBooks, getGenres } from "@/services/api";
import { BookCard } from "@/components/book/BookCard";
import { BookStatus, GenreSlug } from "@/types";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialGenres = (searchParams.get("genres")?.split(",").filter(Boolean) as GenreSlug[]) ?? [];
  const initialStatus = (searchParams.get("status") as BookStatus | "all") ?? "all";
  const initialSort =
    (searchParams.get("sort") as "popular" | "newest" | "rating" | "az") ?? "popular";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedGenres, setSelectedGenres] = useState<GenreSlug[]>(initialGenres);
  const [status, setStatus] = useState<BookStatus | "all">(initialStatus);
  const [sort, setSort] = useState<"popular" | "newest" | "rating" | "az">(initialSort);
  const [pageSize, setPageSize] = useState(12);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Keep filters synchronized in the URL query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    if (status !== "all") params.set("status", status);
    if (sort !== "popular") params.set("sort", sort);

    const qs = params.toString();
    router.replace(qs ? `/browse?${qs}` : "/browse", { scroll: false });
  }, [debouncedQuery, selectedGenres, status, sort, router]);

  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["books-browse", debouncedQuery, selectedGenres, status, sort, pageSize],
    queryFn: () =>
      getBooks({
        query: debouncedQuery,
        genres: selectedGenres,
        status,
        sort,
        page: 1,
        pageSize,
      }),
  });

  const toggleGenre = (slug: GenreSlug) => {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedGenres([]);
    setStatus("all");
    setSort("popular");
  };

  const FilterControls = () => (
    <div className="space-y-5">
      {/* Multi-Genre Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Genres (Select Multiple)
        </span>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => {
            const active = selectedGenres.includes(g.slug);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.slug)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-fg font-semibold shadow-sm"
                    : "border border-border bg-surface-soft/60 text-text hover:bg-surface-soft"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status & Sort */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Book Status
          </label>
          <div className="flex rounded-xl bg-surface-soft p-1">
            {(["all", "ongoing", "completed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize ${
                  status === st ? "bg-surface text-text shadow-sm font-semibold" : "text-text-muted"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="sort-select"
            className="text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            Sort By
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Recently Updated</option>
            <option value="rating">Highest Rated</option>
            <option value="az">Title (A – Z)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-fluid-h1 font-semibold">Browse Stories</h1>
          <p className="text-sm text-text-muted">
            Explore calm novels, filter by mood, or search by author and title.
          </p>
        </div>

        {/* Mobile Bottom Sheet Trigger */}
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="inline-flex sm:hidden h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-semibold text-text shadow-calm"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters ({selectedGenres.length + (status !== "all" ? 1 : 0)})
        </button>
      </div>

      {/* Search Bar & Desktop Filter Panel */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-calm space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by book title, author, or keyword..."
            aria-label="Search catalog"
            className="h-12 w-full rounded-2xl border border-border bg-bg pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="hidden sm:block">
          <FilterControls />
        </div>

        {(query || selectedGenres.length > 0 || status !== "all") && (
          <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-text-muted">
              Showing {data?.books.length ?? 0} of {data?.total ?? 0} matching books
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="font-semibold text-text underline hover:text-primary"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] animate-pulse rounded-2xl bg-surface-soft"
            />
          ))}
        </div>
      ) : !data || data.books.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-14 text-center space-y-4 shadow-calm">
          <BookOpen className="mx-auto h-10 w-10 text-text-muted" />
          <h2 className="font-serif text-xl font-semibold">No matching stories found</h2>
          <p className="mx-auto max-w-md text-sm text-text-muted">
            Try removing one of your genre tags or searching with a broader keyword.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-fg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {data.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {data.total > data.books.length && (
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={() => setPageSize((prev) => prev + 12)}
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-8 text-sm font-semibold text-text shadow-calm hover:bg-surface-soft"
              >
                Load More Books ({data.total - data.books.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile Bottom Sheet for Filters */}
      {mobileSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Books"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 sm:hidden"
        >
          <div className="rounded-t-3xl border-t border-border bg-surface p-6 space-y-6 shadow-calm-hover">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-semibold">Filter & Sort</h2>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterControls />
            <button
              type="button"
              onClick={() => setMobileSheetOpen(false)}
              className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-fg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-8">Loading catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}