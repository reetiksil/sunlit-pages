// src/components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div>
          <p className="font-serif text-base font-semibold text-text">{siteConfig.name}</p>
          <p className="text-xs text-text-muted">{siteConfig.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs font-medium text-text-muted">
          <Link href="/browse" className="hover:text-text">Browse</Link>
          <Link href="/read-your-own" className="hover:text-text">Upload & Read</Link>
          <Link href="/bookshelf" className="hover:text-text">Bookshelf</Link>
          <Link href="/admin" className="hover:text-text">Curator Studio</Link>
        </div>
      </div>
    </footer>
  );
}