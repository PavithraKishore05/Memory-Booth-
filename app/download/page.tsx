"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, Share2, Camera, ArrowLeft, Check } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { PhotoStrip } from "@/components/photo-strip"
import { useBooth } from "@/components/booth-provider"
import { renderStrip, downloadDataUrl } from "@/lib/render-strip"

export default function DownloadPage() {
  const router = useRouter()
  const { state, ready } = useBooth()
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

        <div className="mt-12 grid items-start gap-8 md:grid-cols-2">
          {/* preview */}
          <div className="flex justify-center">
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
          <div className="flex flex-col gap-2 md:pt-6">
            <button
              onClick={handleDownload}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-transform enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-60"
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
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <Share2 className="size-5" />
              Share
            </button>

            {shareMsg && (
              <p className="text-center text-sm text-muted-foreground">
                {shareMsg}
              </p>
            )}

            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/booth"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-4" /> Edit again
              </Link>
              <Link
                href="/booth"
                onClick={() => {
                  // fresh start handled on booth via retake; keep simple
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Camera className="size-4" /> New strip
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
