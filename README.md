Here is a comprehensive, production-grade `README.md` for **Sunlit Pages**, structured for software engineering portfolio evaluation, clear architecture review, and developer onboarding.

---

```markdown
# ☀️ Sunlit Pages

> A calm, minimal, distraction-free online book and light-novel sanctuary engineered with Next.js (App Router), TypeScript, and browser-first client storage.

[![CI Pipeline](https://github.com/your-username/sunlit-pages/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/sunlit-pages/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue.svg)](https://www.typescriptlang.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org/)

---

## 📖 Overview

**Sunlit Pages** was built to solve reading fatigue caused by noisy, ad-cluttered novel platforms. It combines warm, tactile typography inspired by physical books with modern web capabilities: zero-layout-shift SVG book art, persistent local-first IndexedDB storage, independent reader surface themes, and a fully typed service abstraction layer designed for plug-and-play backend migration.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components where applicable) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any`) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with semantic design tokens via CSS variables |
| **Components** | Custom accessible controls built over [Radix UI](https://www.radix-ui.com/) primitives & [Lucide React](https://lucide.dev/) |
| **Motion** | [Framer Motion](https://www.framer.com/motion/) with native `prefers-reduced-motion` compliance |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) + Chrome [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (with `persist` middleware for local settings & bookshelf cache) |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query/latest) (cached async service boundaries) |
| **Client Storage** | [Dexie.js](https://dexie.org/) (Wrapper over IndexedDB for zero-server file privacy) |
| **Reading Engines** | [epub.js](https://github.com/futurepress/epub.js) (EPUB rendering) & [pdfjs-dist](https://mozilla.github.io/pdf.js/) (PDF Novel Reader text pipeline) |
| **Rich Text & Charts**| [Tiptap](https://tiptap.dev/) (Draft editor) & [Recharts](https://recharts.org/) (Analytics) |
| **Testing & CI** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/), and [GitHub Actions](https://github.com/features/actions) |

---

## ✨ Key Features

### 1. Distraction-Free Reading Engine (`/book/[slug]/chapter/[n]`)
* **Dynamic Header Concealment**: Scroll position detection automatically glides the top chrome away during downward reading and restores it on upward gestures or click/tap.
* **Granular Typography Customizer**: Live adjustments for font sizing (`15px`–`28px`), leading (`1.4`–`2.2`), paragraph spacing, and margins (`narrow`, `medium`, `wide`).
* **5 Dedicated Literary Typefaces**:
  * *Lora* (Warm, classic book serif)
  * *Plus Jakarta Sans* (Clean contemporary geometry)
  * *Atkinson Hyperlegible* (Braille Institute font optimized for low fatigue)
  * *Merriweather* (High-contrast editorial serif)
  * *JetBrains Mono* (Technical monoline display)
* **Independent Reading Surfaces**: Switch reading surface palette (*Day*, *Sepia*, *Paper*, *Night*, *OLED True Dark*) independently of the global application theme.
* **Chapter Progress Persistence**: Automatic per-book location tracking and scroll depth saved locally.

### 2. Private "Upload & Read" Browser Sandbox (`/read-your-own`)
* **100% Client-Side Privacy**: Upload `.epub` and `.pdf` files up to 25 MB directly into the browser's IndexedDB via Dexie. No documents or personal metadata are ever sent across a network.
* **PDF Novel Reader Mode**: An intelligent line-clustering pipeline parses raw PDF text layers into readable, spaced editorial paragraphs, bypassing dense fixed-width document styling.
* **Lazy-Loaded Engines**: Heavy engines (`epub.js` and `pdfjs-dist`) are dynamically imported on-demand, protecting the initial site bundle size.

### 3. Catalog & Discovery Engine (`/browse`, `/`)
* **Procedural SVG Book Jackets**: Fully copyright-safe vector book covers generated dynamically based on mood, palette tokens, and motifs (sun, moon, waves, foliage, archways).
* **URL-Synced Parametric Filtering**: Real-time debounce queries, multi-genre selection chips, publication status (`ongoing`/`completed`), and sorting strategies mirrored directly into URL search parameters.
* **Curated Home Hub**: Accessible hero carousel with touch-swipe and auto-pause on focus/hover, alongside an adaptive "Continue Reading" shelf.

### 4. Admin Studio & Auth Guard (`/admin`, `/login`)
* **Role-Guarded Access**: Isolated permissions between regular `reader` sessions and `admin` curators.
* **Curator Studio**: Recharts weekly engagement trends, complete book catalog CRUD operations, and an integrated Tiptap rich-text chapter drafting workbench.

---

## 📐 Design System & Accessibility

* **WCAG 2.1 AA Compliance**: All daytime and nighttime color tokens guarantee strict contrast ratios:
  * Page background (`--bg`: `#FFF9EF`) vs Primary text (`--text`: `#2F3B4A`) achieves **10.6:1 (AAA)**.
  * Yellow accents (`--primary`: `#F6B94C`) paired with deep amber typography (`--primary-fg`: `#3B2A0A`) achieve **7.1:1 (AAA)**.
* **Reduced Motion**: All ambient animated SVG clouds, floating light particles, and view-transition circular reveals evaluate `prefers-reduced-motion: reduce`, dropping smoothly to instantaneous or subtle linear opacity fades.
* **Fluid Geometry**: Fluid type and responsive layout grids utilize CSS `clamp()` without sudden horizontal jumps or layout shifts across viewport widths from `320px` to `4K`.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.17.0` or `>= 20.0.0`
* **Package Manager**: `npm` (v9+) or `pnpm`

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/sunlit-pages.git](https://github.com/your-username/sunlit-pages.git)
   cd sunlit-pages

```

2. Install dependencies:
```bash
npm install

```


3. Launch the local development server:
```bash
npm run dev

```


4. Open your browser and navigate to:
```text
http://localhost:3000

```



---

## 🧪 Testing & Verification

The test suite covers state stores, complex filter pipelines, and end-to-end browser journeys:

```bash
# Execute unit & integration test suites (Vitest)
npm run test

# Run tests in watch mode
npm run test:watch

# Validate TypeScript typing across all boundaries
npm run type-check

# Run Next.js ESLint configuration
npm run lint

# Run Playwright End-to-End automated user journeys
npm run test:e2e

```

---

## 🔌 Swapping the Mock Service Layer for a Real API

The application strictly decouples components from data operations through **`src/services/api.ts`**. No component directly executes data fetching or mutates local seed state.

To connect a backend provider (such as [Supabase](https://supabase.com/), Firebase, or an external REST/GraphQL API):

1. **Keep the TypeScript contracts**: Do not alter `src/types/index.ts`.
2. **Update the service functions in `src/services/api.ts**`:
```ts
// Example: Migrating getBooks to Supabase
import { supabase } from "@/lib/supabaseClient";
import { Book, BookFilterParams } from "@/types";

export async function getBooks(filters?: BookFilterParams): Promise<{ books: Book[]; total: number }> {
  let query = supabase.from("books").select("*", { count: "exact" });

  if (filters?.query) {
    query = query.ilike("title", `%${filters.query}%`);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { books: data as Book[], total: count ?? 0 };
}

```


3. Because the UI consumes these calls via TanStack Query (`useQuery`), **zero component files need to be rewritten** during a backend migration.

---

## 📂 Project Directory Structure

```text
sunlit-pages/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated lint, type-check, test, and build pipeline
├── e2e/
│   └── reader.spec.ts             # Playwright multi-step end-to-end user journey
├── public/
│   ├── favicon.ico
│   └── robots.txt                 # Search bot indexing directives
├── src/
│   ├── app/                       # Next.js App Router endpoints & layouts
│   │   ├── admin/page.tsx         # Curator analytics, book CRUD & Tiptap editor
│   │   ├── book/[slug]/           # Book profile, chapters, and reviews
│   │   │   └── chapter/[n]/       # Distraction-free novel reading interface
│   │   ├── bookshelf/page.tsx     # Local user library & shelf tabs
│   │   ├── browse/page.tsx        # Search, multi-genre chips & catalog grid
│   │   ├── login/page.tsx         # Validated authentication & role switcher
│   │   ├── read-your-own/         # Client-side IndexedDB sandbox for EPUB & PDF
│   │   ├── error.tsx              # Error boundary
│   │   ├── layout.tsx             # Root layout with Google font optimization
│   │   ├── not-found.tsx          # Custom 404 page
│   │   ├── page.tsx               # Homepage with hero carousel & shelves
│   │   └── sitemap.ts             # Programmatic XML sitemap generator
│   ├── components/                # Modular UI presentation layer
│   │   ├── background/            # Ambient canvas and SVG night sky components
│   │   ├── book/                  # BookCard, HeroCarousel, procedural SvgCover
│   │   ├── layout/                # Responsive Header, Footer, ThemeToggle
│   │   └── reader/                # ReaderSettingsDrawer with real-time controls
│   ├── config/
│   │   └── site.ts                # Global site metadata & upload constraints
│   ├── data/
│   │   └── seed.ts                # 24 public-domain seeded books and chapters
│   ├── lib/
│   │   ├── db.ts                  # Dexie.js IndexedDB schema
│   │   ├── utils.ts               # Tailwind class merging & formatting utilities
│   │   └── validations.ts         # Zod schemas for file uploads and auth
│   ├── services/
│   │   └── api.ts                 # Typed service abstraction boundary
│   ├── stores/                    # Zustand stores with localStorage persistence
│   │   ├── useAuthStore.ts
│   │   ├── useBookshelfStore.ts
│   │   └── useReaderStore.ts
│   ├── styles/
│   │   └── globals.css            # Design tokens, themes & reader surfaces
│   ├── types/
│   │   └── index.ts               # Core domain TypeScript models
│   └── __tests__/                 # Vitest unit test suites
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts

```

---

## ⚡ Performance & Lighthouse Targets

Built according to modern Web Vitals optimization practices:

* **Font Optimization**: Loaded via `next/font/google` using CSS variables to eliminate layout shift and external network roundtrips.
* **Vector Graphics**: Procedural covers generated via raw inline SVGs to minimize HTTP image payload overhead.
* **Zero Cumulative Layout Shift (CLS)**: Fixed aspect ratio frames across all card components.

| Metric | Target Score |
| --- | --- |
| **Performance** | `95+` |
| **Accessibility** | `100` |
| **Best Practices** | `100` |
| **SEO** | `100` |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

```

```