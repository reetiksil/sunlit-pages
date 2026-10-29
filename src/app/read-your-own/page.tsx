"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { validateBookFile } from "@/lib/validations";
import { siteConfig } from "@/config/site";
import { UploadedBook } from "@/types";
import { useReaderStore } from "@/stores/useReaderStore";
import { ReaderSettingsDrawer } from "@/components/reader/ReaderSettingsDrawer";

const FONT_MAP: Record<string, string> = {
  serif: "var(--font-lora), 'Lora', Georgia, serif",
  sans: "var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif",
  dyslexic: "var(--font-atkinson), 'Atkinson Hyperlegible', sans-serif",
  "modern-serif": "var(--font-merriweather), 'Merriweather', Georgia, serif",
  mono: "var(--font-mono), 'JetBrains Mono', monospace",
};

interface ExtractedPage {
  pageNumber: number;
  paragraphs: string[];
}

export default function UploadAndReadPage() {
  const uploadedBooks = useLiveQuery(() => db.uploadedBooks.reverse().toArray(), []) ?? [];
  const { settings } = useReaderStore();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeBook, setActiveBook] = useState<UploadedBook | null>(null);
  const [isReaderMode, setIsReaderMode] = useState(true);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const epubContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  const closeViewer = () => {
    setActiveBook(null);
    setExtractedPages([]);
    pdfDocRef.current = null;
    setCurrentPage(1);
    setTotalPages(1);
  };

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
        title: file.name.replace(/\.(epub|pdf)$/i, "").replace(/[_-]/g, " "),
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
      setErrorMsg("Failed to store file in browser IndexedDB.");
    }
  };

  const renderPdfCanvas = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || !pdfCanvasRef.current) return;
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    } catch (e) {
      console.error("PDF canvas render error:", e);
    }
  }, []);

  useEffect(() => {
    if (activeBook?.format === "pdf" && !isReaderMode) {
      renderPdfCanvas(currentPage);
    }
  }, [activeBook, isReaderMode, currentPage, renderPdfCanvas]);

  const openBookInReader = async (book: UploadedBook) => {
    setErrorMsg(null);
    setIsProcessing(true);
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
          setIsProcessing(false);
        }, 120);
      } catch {
        setErrorMsg("Failed to parse this EPUB. It may be DRM-protected.");
        setIsProcessing(false);
      }
    } else {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const loadingTask = pdfjs.getDocument({ data: book.fileBlob.slice(0) });
        const pdfDoc = await loadingTask.promise;
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);

        const pagesData: ExtractedPage[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();

          let lines: { text: string; y: number }[] = [];
          for (const item of content.items) {
            if ("str" in item && item.str.trim()) {
              lines.push({ text: item.str, y: item.transform[5] });
            }
          }

          // Cluster characters on matching or descending baseline lines
          lines.sort((a, b) => b.y - a.y);
          const rawParagraphs: string[] = [];
          let currentParagraph = "";
          let prevY: number | null = null;

          for (const line of lines) {
            if (prevY !== null && Math.abs(line.y - prevY) > 14) {
              if (currentParagraph.trim()) rawParagraphs.push(currentParagraph.trim());
              currentParagraph = line.text;
            } else {
              currentParagraph += (currentParagraph ? " " : "") + line.text;
            }
            prevY = line.y;
          }
          if (currentParagraph.trim()) rawParagraphs.push(currentParagraph.trim());

          pagesData.push({
            pageNumber: i,
            paragraphs: rawParagraphs.length > 0 ? rawParagraphs : ["(No extractable text on this page)"],
          });
        }

        setExtractedPages(pagesData);
        setCurrentPage(1);
        setIsProcessing(false);
      } catch (err: unknown) {
        setIsProcessing(false);
        const msg = err instanceof Error ? err.message : "";
        setErrorMsg(msg.toLowerCase().includes("password") ? "This PDF is password-protected." : "Could not parse this PDF.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      {activeBook ? (
        <section
          data-reader-theme={settings.theme}
          className="relative rounded-3xl border border-border p-6 sm:p-10 shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: "var(--reader-bg)",
            color: "var(--reader-text)",
          }}
        >
          {/* Reader Top Action Bar with Clear/Close Button */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--reader-border)" }}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeViewer}
                className="flex h-10 items-center gap-1.5 rounded-full border border-border/80 px-4 text-xs font-semibold hover:bg-black/5 transition-colors"
                style={{ borderColor: "var(--reader-border)" }}
              >
                <X className="h-4 w-4" />
                <span>Close Document</span>
              </button>
              <div>
                <h2 className="font-serif text-lg font-semibold line-clamp-1">{activeBook.title}</h2>
                <span className="text-[11px] opacity-75">{activeBook.format.toUpperCase()} · Private Browser Storage</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeBook.format === "pdf" && (
                <button
                  type="button"
                  onClick={() => setIsReaderMode((prev) => !prev)}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ borderColor: "var(--reader-border)" }}
                >
                  {isReaderMode ? "View Original PDF" : "Switch to Flow Mode"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg shadow-sm hover:brightness-105"
              >
                <Settings2 className="h-4 w-4" />
                <span>Typography</span>
              </button>
            </div>
          </header>

          {isProcessing ? (
            <div className="py-24 text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="font-serif text-sm opacity-70">Structuring document for calm reading...</p>
            </div>
          ) : activeBook.format === "epub" ? (
            <div ref={epubContainerRef} className="min-h-[620px] w-full pt-6" />
          ) : isReaderMode ? (
            /* Structured Flow Mode */
            <article
              className="mx-auto pt-8 pb-12 transition-all"
              style={{
                maxWidth: settings.contentWidth === "narrow" ? "56ch" : settings.contentWidth === "wide" ? "82ch" : "68ch",
                fontFamily: FONT_MAP[settings.fontFamily] ?? FONT_MAP.serif,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                textAlign: settings.textAlign,
              }}
            >
              <div className="mb-6 flex justify-between border-b pb-2 text-[11px] opacity-60" style={{ borderColor: "var(--reader-border)" }}>
                <span>Page {currentPage} of {totalPages}</span>
                <span>Novel Flow View</span>
              </div>
              <div className="space-y-6">
                {extractedPages[currentPage - 1]?.paragraphs.map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ) : (
            /* Original Page Canvas View */
            <div className="flex flex-col items-center justify-center pt-8">
              <canvas ref={pdfCanvasRef} className="max-w-full rounded-xl shadow-lg border" style={{ borderColor: "var(--reader-border)" }} />
            </div>
          )}

          {activeBook.format === "pdf" && !isProcessing && (
            <nav className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: "var(--reader-border)" }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-10 items-center gap-1 rounded-full border px-4 text-xs font-semibold disabled:opacity-40"
                style={{ borderColor: "var(--reader-border)" }}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs font-medium opacity-70">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      ) : (
        /* Library View */
        <div className="space-y-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-mint/30 px-3.5 py-1 text-xs font-semibold text-text">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-mint-fg" />
              Zero-Server Private IndexedDB
            </span>
            <h1 className="font-serif text-fluid-h1 font-semibold">Bring Your Own Reading Material</h1>
            <p className="max-w-xl text-sm text-text-muted leading-relaxed">
              Drop an EPUB or PDF here. Your documents are stored locally in your browser and never uploaded anywhere.
            </p>
          </div>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface p-12 text-center shadow-sm transition-all hover:border-primary hover:bg-surface-soft/40"
          >
            <UploadCloud className="h-10 w-10 text-primary" />
            <span className="mt-3 font-serif text-base font-semibold text-text">
              Click or drag an .epub or .pdf file here
            </span>
            <span className="mt-1 text-xs text-text-muted">
              Supported up to {siteConfig.maxUploadSizeMB} MB
            </span>
            <input
              type="file"
              accept=".epub,.pdf,application/epub+zip,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-accent-blush/25 p-4 text-xs font-medium text-text border border-accent-blush/60">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold">Your Local Shelf ({uploadedBooks.length})</h2>
            {uploadedBooks.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
                No local documents saved yet. Upload one above to begin reading.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedBooks.map((b) => (
                  <div key={b.id} className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
                    <div className="space-y-1">
                      <span className="rounded bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase">{b.format}</span>
                      <h3 className="font-serif text-base font-semibold text-text line-clamp-1">{b.title}</h3>
                      <p className="text-[11px] text-text-muted">{(b.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openBookInReader(b)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Read Now
                      </button>
                      <button
                        type="button"
                        onClick={() => db.uploadedBooks.delete(b.id)}
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