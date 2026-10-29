# Sunlit Pages — Calm, Minimal Online Book & Light-Novel Sanctuary

A portfolio-grade Next.js (App Router) frontend for distraction-free reading, featuring a typed service layer, customizable novel reader, client-side `.epub` and `.pdf` personal library (IndexedDB), and role-guarded Curator Studio.

## Quick Rename
To rename the site across all pages, headers, metadata, and footers, edit **`src/config/site.ts`**:
```ts
export const siteConfig = {
  name: "Your Custom Name",
  // ...
};