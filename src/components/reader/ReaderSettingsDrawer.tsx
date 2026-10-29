// src/app/read-your-own/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  UploadCloud,
  BookOpen,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Settings2,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { validateBookFile } from "@/lib/validations";
import { siteConfig } from "@/config/site";
import { UploadedBook } from "@/types";
import { useReaderStore } from "@/stores/useReaderStore";

function ReaderSettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-settings-title"
        className="h-full w-full max-w-sm bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="reader-settings-title" className="font-serif text-lg font-semibold">Reader Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close reader settings" className="rounded-full p-2 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm text-text-muted">Adjust your reading preferences in the reader controls.</p>
      </section>
    </div>
  );
}

const FONT_MAP: Record<string, string> = {
  serif: "var(--font-lora), 'Lora', Georgia, serif",
  sans: "var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif",
  dyslexic: "var(--font-atkinson), 'Atkinson Hyperlegible', sans-serif",
  "modern-serif": "var(--font-merriweather), 'Merriweather', Georgia, serif",
  mono: "var(--font-mono), 'JetBrains Mono', monospace",
};

export default function UploadAndReadPage() {
  const uploadedBooks = useLiveQuery(() => db.uploadedBooks.reverse().toArray(), []) ?? [];
  const { settings } = useReaderStore();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeBook, setActiveBook] = useState<UploadedBook | null>(null);
  const [pdfPages, setPdfPages] = useState<{ pageNumber: number; paragraphs: string[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const epubContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelect = async (file: File | null) => {
    setErrorMsg(null);
    if (!file) return;

    const validation = validateBookFile({ name: file.name, size: file.size });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const isEpub = file.name.toLowerCase().endsWith(".epub");

      const newEntry: UploadedBook = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.(epub|pdf)$/i, ""),
        author: "Personal Library",
        format: isEpub ? "epub" : "pdf",
        sizeBytes: file.size,
        fileBlob: arrayBuffer,
        progressPercentage: 0,
        lastLocation: "1",
        addedAt: new Date().toISOString(),
      };

      await db.uploadedBooks.add(newEntry);
    } catch {
      setErrorMsg("Unable to save this file locally. Check disk storage and permissions.");
    }
  };

  const closeViewer = () => {
    setActiveBook(null);
    setPdfPages([]);
    setCurrentPage(1);
  };

  const openBookInReader = async (book: UploadedBook) => {
    setErrorMsg(null);
    setLoadingFile(true);
    setActiveBook(book);

    if (book.format === "epub") {
      try {
        const ePubModule = await import("epubjs");
        const ePub = ePubModule.default;
        const epubInstance = ePub(book.fileBlob.slice(0));
        setTimeout(() => {
          if (epubContainerRef.current) {
            epubContainerRef.current.innerHTML = "";
            const rendition = epubInstance.renderTo(epubContainerRef.current, {
              width: "100%",
              height: 640,
              flow: "scrolled-doc",
            });
            rendition.display();
          }
          setLoadingFile(false);
        }, 100);
      } catch {
        setErrorMsg("Failed to parse this EPUB. It may be DRM-protected or corrupted.");
        setLoadingFile(false);
      }
    } else {
      // Structured PDF Reader with Paragraph Detection
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const loadingTask = pdfjs.getDocument({ data: book.fileBlob.slice(0) });
        const pdfDoc = await loadingTask.promise;
        setTotalPages(pdfDoc.numPages);

        const extractedPages: { pageNumber: number; paragraphs: string[] }[] = [];

        // Extract and cluster lines to avoid huge mashed single strings
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          
          let pageText = "";
          let lastY: number | null = null;

          for (const item of content.items) {
            if ("str" in item) {
              const currentY = item.transform[5];
              // If line moved vertically, treat as newline
              if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                pageText += "\n";
              }
              pageText += item.str + " ";
              lastY = currentY;
            }
          }

          // Split by double newline or carriage return into real paragraphs
          const paragraphs = pageText
            .split(/\n{2,}|\r\n{2,}/)
            .map((p) => p.replace(/\s+/g, " ").trim())
            .filter((p) => p.length > 2);

          extractedPages.push({
            pageNumber: i,
            paragraphs: paragraphs.length > 0 ? paragraphs : ["(Page contains illustrations or non-extractable text)"],
          });
        }

        setPdfPages(extractedPages);
        setCurrentPage(1);
        setLoadingFile(false);
      } catch (err: unknown) {
        setLoadingFile(false);
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("password")) {
          setErrorMsg("This PDF is password-protected. Please decrypt it before reading.");
        } else {
          setErrorMsg("Could not extract text from this PDF.");
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      {/* Active Reading Workspace */}
      {activeBook ? (
        <section
          data-reader-theme={settings.theme}
          className="relative rounded-3xl border border-border p-6 sm:p-10 shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: "var(--reader-bg)",
            color: "var(--reader-text)",
          }}
        >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--reader-border)" }}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeViewer}
                aria-label="Exit Viewer"
                className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-black/5"
                style={{ borderColor: "var(--reader-border)" }}
              >
                <X className="h-4 w-4" />
              </button>
              <div>
                <h2 className="font-serif text-lg font-semibold line-clamp-1">{activeBook.title}</h2>
                <span className="text-[11px] opacity-70">
                  {activeBook.format.toUpperCase()} · Stored Locally
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg shadow-sm hover:brightness-105"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Reader Settings
              </button>
            </div>
          </div>

          {loadingFile ? (
            <div className="py-24 text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm opacity-70 font-serif">Formatting text for calm reading...</p>
            </div>
          ) : activeBook.format === "epub" ? (
            <div ref={epubContainerRef} className="min-h-[600px] w-full pt-6" />
          ) : (
            <div className="pt-8">
              {/* PDF Novel Reader Mode with Paragraphs */}
              <div
                className="mx-auto max-w-[68ch] space-y-6"
                style={{
                  fontFamily: FONT_MAP[settings.fontFamily] ?? FONT_MAP.serif,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                  textAlign: settings.textAlign,
                }}
              >
                {pdfPages[currentPage - 1]?.paragraphs.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* PDF Bottom Pagination */}
              <nav className="mt-12 flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--reader-border)" }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-10 items-center gap-1 rounded-full border px-4 text-xs font-semibold disabled:opacity-40"
                  style={{ borderColor: "var(--reader-border)" }}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Page
                </button>
                <span className="text-xs font-medium opacity-70">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg disabled:opacity-40"
                >
                  Next Page <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </section>
      ) : (
        /* Library Mode */
        <div className="space-y-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-mint/30 px-3.5 py-1 text-xs font-semibold text-text">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Private Browser IndexedDB
            </span>
            <h1 className="font-serif text-fluid-h1 font-semibold">Your Personal Reading Room</h1>
            <p className="max-w-xl text-sm text-text-muted">
              Add any personal EPUB or PDF document. Files stay inside your browser and never touch an external server.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface p-10 text-center shadow-sm transition-all hover:border-primary hover:bg-surface-soft/40"
          >
            <UploadCloud className="h-10 w-10 text-primary" />
            <span className="mt-3 font-serif text-base font-semibold text-text">
              Drop an .epub or .pdf here to begin
            </span>
            <span className="mt-1 text-xs text-text-muted">
              Maximum size: {siteConfig.maxUploadSizeMB} MB
            </span>
            <input
              type="file"
              accept=".epub,.pdf,application/epub+zip,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-accent-blush/25 p-4 text-xs font-medium text-text border border-accent-blush/50">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Saved Books Grid */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold">Uploaded Books ({uploadedBooks.length})</h2>
            {uploadedBooks.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
                Your browser library is empty. Upload an EPUB or PDF to begin.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedBooks.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm"
                  >
                    <div className="space-y-1">
                      <span className="rounded bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase">
                        {b.format}
                      </span>
                      <h3 className="font-serif text-base font-semibold text-text line-clamp-1">
                        {b.title}
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        {(b.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openBookInReader(b)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => db.uploadedBooks.delete(b.id)}
                        aria-label={`Delete ${b.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:bg-accent-blush/25 hover:text-text"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ReaderSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}