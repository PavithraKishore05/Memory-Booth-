"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, Share2, Camera, ArrowLeft, Check, BookOpen } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { PhotoStrip } from "@/components/photo-strip"
import { useBooth } from "@/components/booth-provider"
import { renderStrip, downloadDataUrl } from "@/lib/render-strip"

export default function DownloadPage() {
  const router = useRouter()
  const { state, ready, reset } = useBooth()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [shareMsg, setShareMsg] = useState("")
  const isComplete = state.photos.length > 0 && state.photos.every(Boolean)

  useEffect(() => {
    if (ready && !isComplete) {
      router.replace("/booth")
    }
  }, [ready, isComplete, router])

  async function handleDownload() {
    setBusy(true)
    try {
      const dataUrl = await renderStrip(state, { scale: 3 })
      downloadDataUrl(dataUrl, `polaroid-booth-${Date.now()}.png`)
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch (e) {
      console.log("[v0] export error:", (e as Error)?.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    setBusy(true)
    try {
      const dataUrl = await renderStrip(state, { scale: 3 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], "polaroid-booth.png", { type: "image/png" })
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: "My Polaroid Booth strip",
          text: "Made with Polaroid Booth ✨",
        })
      } else {
        downloadDataUrl(dataUrl, `polaroid-booth-${Date.now()}.png`)
        setShareMsg("Sharing isn't supported here, so we downloaded it instead.")
        setTimeout(() => setShareMsg(""), 4000)
      }
    } catch (e) {
      console.log("[v0] share error:", (e as Error)?.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ready || !isComplete) {
    return (
      <main className="min-h-dvh bg-paper-grid">
        <SiteNav />
        <div className="grid place-items-center py-32 text-muted-foreground">
          Loading your strip…
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-paper-grid pb-16">
      <SiteNav />

      <section className="mx-auto max-w-5xl px-5 pt-12 sm:pt-16">
        <div className="text-center">
          <div className="relative inline-block">
            <span className="pointer-events-none absolute -left-8 -top-4 hidden -rotate-12 text-3xl sm:block">
              🌸
            </span>
            <span className="pointer-events-none absolute -right-8 -top-3 hidden rotate-12 text-3xl sm:block">
              ☀️
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Your strip is ready
            </h1>
          </div>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Download it in high resolution, share it, or head back to make
            another.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
          {/* preview */}
          <div className="flex justify-center h-[520px] sm:h-[600px] lg:h-[680px]">
            <div className="origin-top rotate-[-2deg] scale-[0.48] sm:scale-[0.55] lg:scale-[0.62]">
              <PhotoStrip
                photos={state.photos}
                filter={state.filter}
                frame={state.frame}
                stickers={state.stickers}
                caption={state.caption}
                date={state.date}
              />
            </div>
          </div>

          {/* actions */}
          <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center md:pt-4">
            {/* Header section */}
            <div className="mb-4 flex flex-col items-center">
              <span className="text-3xl animate-pulse">💓</span>
              <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
                Love this memory?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Save it, share it, keep it forever.
              </p>
            </div>

            {/* Buttons stack */}
            <div className="flex w-full flex-col gap-2.5">
              <button
                onClick={handleDownload}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-transform enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {done ? (
                  <>
                    <Check className="size-5" /> Saved!
                  </>
                ) : (
                  <>
                    <Download className="size-5" />
                    {busy ? "Preparing…" : "Download strip (HD)"}
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 cursor-pointer"
              >
                <Share2 className="size-5" />
                Share
              </button>

              {shareMsg && (
                <p className="text-sm text-muted-foreground mt-1">
                  {shareMsg}
                </p>
              )}

              {/* Divider */}
              <div className="my-2 flex items-center gap-3 w-full">
                <hr className="flex-1 border-t border-border/80" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">or</span>
                <hr className="flex-1 border-t border-border/80" />
              </div>

              {/* Add to Memory Book button */}
              <Link
                href="/memory-book"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary/20 bg-card px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/5 hover:border-primary hover:scale-[1.02] active:scale-95"
              >
                <BookOpen className="size-4" />
                Add to Memory Book &rarr;
              </Link>
              
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Keep journaling your beautiful days.
              </p>

              {/* Secondary Navigation */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row w-full">
                <Link
                  href="/booth"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="size-4" /> Edit again
                </Link>
                <button
                  onClick={() => {
                    reset()
                    router.push("/booth")
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  <Camera className="size-4" /> New strip
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
