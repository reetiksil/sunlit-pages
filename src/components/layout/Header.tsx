"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Search, Menu, X, Upload, Shield, UserCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { searchBooks } from "@/services/api";
import { Book } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, toggleRole } = useAuthStore();

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

  // Hide global header inside distraction-free chapter reader (Reader handles its own top bar)
  if (pathname.includes("/chapter/")) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/browse?genres=fantasy", label: "Genres" },
    { href: "/bookshelf", label: "Bookshelf" },
    { href: "/read-your-own", label: "Upload & Read" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "h-16 bg-surface/85 backdrop-blur-md shadow-calm border-b border-border"
          : "h-20 bg-transparent"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg focus:font-medium"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-text">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-soft text-text font-semibold"
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
              className="ml-1 flex items-center gap-1.5 rounded-xl bg-accent-sky/20 px-3.5 py-2 text-sm font-medium text-text hover:bg-accent-sky/35"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Live Search + Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden sm:block w-56 md:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchFocused(false);
                }
              }}
              placeholder="Search titles, authors..."
              aria-label="Search books"
              className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            {/* Live Dropdown */}
            {searchFocused && results.length > 0 && (
              <div
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-calm-hover"
              >
                {results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.slug}`}
                    role="option"
                    aria-selected="false"
                    className="flex flex-col rounded-xl px-3 py-2 hover:bg-surface-soft"
                  >
                    <span className="text-sm font-medium text-text">{book.title}</span>
                    <span className="text-xs text-text-muted">{book.author}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* Role Switcher Badge for Portfolio Demo */}
          <button
            type="button"
            onClick={toggleRole}
            title="Toggle Reader / Admin Role for Portfolio Demo"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium text-text-muted hover:bg-surface-soft hover:text-text min-h-[44px]"
          >
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            Role: <strong className="capitalize text-text">{user?.role ?? "reader"}</strong>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg shadow-sm hover:brightness-105 active:scale-[0.98]"
          >
            {user ? user.name.split(" ")[0] : "Sign In"}
          </Link>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="flex lg:hidden h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-text"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-In Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-6 py-5 shadow-calm-hover">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-text hover:bg-surface-soft"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                toggleRole();
                setMobileMenuOpen(false);
              }}
              className="mt-2 flex items-center justify-between rounded-xl bg-surface-soft px-4 py-3 text-sm font-medium text-text"
            >
              <span>Demo Role: {user?.role}</span>
              <span className="underline">Switch Role</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}