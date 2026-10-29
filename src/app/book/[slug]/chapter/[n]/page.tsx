"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { getChapter } from "@/services/api";
import { useReaderStore } from "@/stores/useReaderStore";
import { ReaderSettingsDrawer } from "@/components/reader/ReaderSettingsDrawer";

export default function ChapterReaderPage() {
  const params = useParams<{ slug: string; n: string }>();
  const router = useRouter();
  const chapterNumber = Number(params.n) || 1;
  const { settings } = useReaderStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["chapter", params.slug, chapterNumber],
    queryFn: () => getChapter(params.slug, chapterNumber),
  });

  return (
    <div data-reader-theme={settings.theme} className="min-h-screen" style={{ backgroundColor: "var(--reader-bg)", color: "var(--reader-text)" }}>
      <header className="sticky top-0 z-40 border-b border-border/50 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href={"/book/" + params.slug} className="p-2"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="text-center truncate">
            <p className="text-xs opacity-70">{data?.book.title}</p>
            <p className="font-serif text-sm font-semibold truncate">Ch. {chapterNumber}: {data?.chapter.title}</p>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2"><Settings2 className="h-5 w-5" /></button>
        </div>
      </header>
      <article className="mx-auto max-w-prose px-4 py-12" style={{ fontSize: settings.fontSize + "px", lineHeight: settings.lineHeight }}>
        <h1 className="font-serif text-2xl font-bold mb-6">{data?.chapter.title}</h1>
        {data?.chapter.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        <div className="mt-12 flex justify-between border-t border-border pt-6 text-sm">
          <button
            disabled={chapterNumber <= 1}
            onClick={() => router.push("/book/" + params.slug + "/chapter/" + (chapterNumber - 1))}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            disabled={!data || chapterNumber >= data.totalChapters}
            onClick={() => router.push("/book/" + params.slug + "/chapter/" + (chapterNumber + 1))}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </article>
      <ReaderSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}