"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Settings2,
} from "lucide-react";
import { getChapter, getChapters } from "@/services/api";
import { useReaderStore } from "@/stores/useReaderStore";
import { useBookshelfStore } from "@/stores/useBookshelfStore";
import { ReaderSettingsDrawer } from "@/components/reader/ReaderSettingsDrawer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function ChapterReaderPage() {
  const params = useParams<{ slug: string; n: string }>();
  const router = useRouter();
  const chapterNumber = Number(params.n) || 1;

  const { settings } = useReaderStore();
  const { updateProgress } = useBookshelfStore();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersDrawerOpen, setChaptersDrawerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["chapter", params.slug, chapterNumber],
    queryFn: () => getChapter(params.slug, chapterNumber),
  });

  const { data: allChapters = [] } = useQuery({
    queryKey: ["chapters", data?.book.id],
    enabled: !!data?.book.id,
    queryFn: () => getChapters(data!.book.id),
  });

  // Track scroll position & auto-hide top bar on downward scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(100, Math.round((currentY / maxScroll) * 100)) : 100;
      setScrollProgress(pct);

      if (currentY > lastScrollY + 18 && currentY > 120) {
        setControlsVisible(false);
      } else if (currentY < lastScrollY - 10 || currentY < 80) {
        setControlsVisible(true);
      }
      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save reading progress per book
  useEffect(() => {
    if (!data) return;
    updateProgress({
      bookId: data.book.id,
      bookSlug: data.book.slug,
      chapterNumber,
      totalChapters: data.totalChapters,
      scrollPercentage: scrollProgress,
    });
  }, [data, chapterNumber, scrollProgress, updateProgress]);

  // Keyboard Left / Right Chapter Navigation
  const goPrev = useCallback(() => {
    if (chapterNumber > 1) {
      router.push(`/book/${params.slug}/chapter/${chapterNumber - 1}`);
    }
  }, [chapterNumber, params.slug, router]);

  const goNext = useCallback(() => {
    if (data && chapterNumber < data.totalChapters) {
      router.push(`/book/${params.slug}/chapter/${chapterNumber + 1}`);
    }
  }, [chapterNumber, data, params.slug, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-reader-serif"
      : settings.fontFamily === "sans"
      ? "font-sans"
      : settings.fontFamily === "dyslexic"
      ? "font-reader-dyslexic"
      : settings.fontFamily === "modern-serif"
      ? "font-reader-modern"
      : "font-reader-mono";

  const widthClass =
    settings.contentWidth === "narrow"
      ? "max-w-[56ch]"
      : settings.contentWidth === "medium"
      ? "max-w-[68ch]"
      : "max-w-[80ch]";

  return (
    <div
      data-reader-theme={settings.theme}
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: "var(--reader-bg)",
        color: "var(--reader-text)",
      }}
    >
      {/* Thin Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-black/10">
        <div
          className="h-full bg-accent-sky transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={scrollProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Chapter reading progress"
        />
      </div>

      {/* Auto-Hiding Reader Header */}
      <header
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${
          controlsVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="mx-auto flex max-w-4xl items-center justify-between rounded-full border px-4 py-2 shadow-calm backdrop-blur-md mt-2"
          style={{
            backgroundColor: "var(--reader-surface)",
            borderColor: "var(--reader-border)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/book/${params.slug}`}
              aria-label="Back to book details"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:opacity-80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="truncate">
              <p className="truncate text-xs opacity-75">{data?.book.title}</p>
              <p className="truncate font-serif text-sm font-semibold">
                Ch. {chapterNumber}: {data?.chapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setChaptersDrawerOpen(!chaptersDrawerOpen)}
              aria-label="Open chapter list"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              aria-label="Open reader appearance settings"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
            >
              <Settings2 className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Distraction-Free Chapter Column */}
      <article
        onClick={() => setControlsVisible((v) => !v)}
        className={`mx-auto px-5 pt-28 pb-24 transition-all ${widthClass} ${fontClass}`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          textAlign: settings.textAlign,
        }}
      >
        {isLoading || !data ? (
          <div className="space-y-6">
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-black/10" />
            <div className="h-40 animate-pulse rounded-xl bg-black/10" />
          </div>
        ) : (
          <>
            <header className="mb-12 border-b pb-8" style={{ borderColor: "var(--reader-border)" }}>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
                Chapter {data.chapter.number} of {data.totalChapters}
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
                {data.chapter.title}
              </h1>
            </header>

            <div>
              {data.chapter.content.map((paragraph, index) => (
                <p
                  key={index}
                  style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Chapter Footer Navigation */}
            <nav
              aria-label="Chapter pagination"
              className="mt-16 flex items-center justify-between gap-4 border-t pt-8 font-sans text-sm"
              style={{ borderColor: "var(--reader-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={goPrev}
                disabled={chapterNumber <= 1}
                className="inline-flex h-12 items-center gap-2 rounded-full border px-5 font-medium disabled:opacity-40"
                style={{ borderColor: "var(--reader-border)" }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={chapterNumber >= data.totalChapters}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-fg disabled:opacity-40"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </>
        )}
      </article>

      {/* Chapter Drawer */}
      {chaptersDrawerOpen && (
        <aside
          aria-label="Table of contents"
          className="fixed inset-y-0 left-0 z-50 w-80 border-r border-border bg-surface p-6 text-text shadow-calm-hover overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold">Chapters</h2>
            <button
              type="button"
              onClick={() => setChaptersDrawerOpen(false)}
              className="text-sm text-text-muted hover:text-text"
            >
              Close
            </button>
          </div>
          <ul className="mt-4 space-y-1.5">
            {allChapters.map((ch) => (
              <li key={ch.id}>
                <Link
                  href={`/book/${params.slug}/chapter/${ch.number}`}
                  onClick={() => setChaptersDrawerOpen(false)}
                  className={`block rounded-xl px-3.5 py-2.5 text-sm ${
                    ch.number === chapterNumber
                      ? "bg-primary text-primary-fg font-semibold"
                      : "hover:bg-surface-soft"
                  }`}
                >
                  Ch. {ch.number}: {ch.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <ReaderSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}