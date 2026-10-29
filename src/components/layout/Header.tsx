"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Search, Menu, X, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { searchBooks } from "@/services/api";
import { Book } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const res = await searchBooks(searchQuery);
        setResults(res);
      } else {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (pathname.includes("/chapter/")) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Catalog" },
    { href: "/bookshelf", label: "My Bookshelf" },
    { href: "/read-your-own", label: "Personal Reader" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "h-16 bg-surface/90 backdrop-blur-md shadow-sm border-b border-border/80"
          : "h-20 bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl py-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-text">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  active
                    ? "bg-surface-soft text-text shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-surface-soft/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="ml-2 flex items-center gap-1.5 rounded-xl bg-accent-sky/20 px-3.5 py-2 text-xs font-semibold text-text hover:bg-accent-sky/35"
            >
              <Shield className="h-3.5 w-3.5" />
              Curator Studio
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-52 md:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchFocused(false);
                }
              }}
              placeholder="Search author, title..."
              className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {searchFocused && results.length > 0 && (
              <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-2xl">
                {results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.slug}`}
                    className="flex flex-col rounded-xl px-3 py-2 hover:bg-surface-soft"
                  >
                    <span className="text-xs font-semibold text-text">{book.title}</span>
                    <span className="text-[11px] text-text-muted">{book.author}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />

          <Link
            href="/login"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg shadow-sm hover:brightness-105"
          >
            {user?.name ? user.name.split(" ")[0] : "Sign In"}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-text"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}