"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, RotateCcw, ChevronLeft } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { CameraCapture } from "@/components/camera-capture"
import { PhotoStrip } from "@/components/photo-strip"
import { useBooth } from "@/components/booth-provider"
import {
  FILTERS,
  FRAMES,
  STICKER_SET,
  type PlacedSticker,
} from "@/lib/booth-types"
import { fileToSquareDataUrl } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

const SHOTS = 4

export default function BoothPage() {
  const router = useRouter()
  const { state, setPhotos, setFilter, setFrame, setStickers, setCaption } =
    useBooth()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null)
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(null)

  const hasPhotos = state.photos.length > 0
  const allPhotosFilled = state.photos.length === SHOTS && state.photos.every(Boolean)

  function addSticker(emoji: string) {
    const sticker: PlacedSticker = {
      id: crypto.randomUUID(),
      emoji,
      x: 0.5,
      y: 0.3 + Math.random() * 0.4,
      scale: 1,
      rotation: Math.round((Math.random() - 0.5) * 30),
    }
    setStickers([...state.stickers, sticker])
    setSelectedSticker(sticker.id)
  }

  function updateSticker(id: string, patch: Partial<PlacedSticker>) {
    setStickers(
      state.stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  }

  function removeSticker(id: string) {
    setStickers(state.stickers.filter((s) => s.id !== id))
    setSelectedSticker(null)
  }

  function replacePhoto(index: number, photo: string) {
    const next = [...state.photos]
    while (next.length < SHOTS) {
      next.push("")
    }
    next[index] = photo
    setPhotos(next)
  }

  function requestUpload(index: number) {
    setUploadTargetIndex(index)
    uploadInputRef.current?.click()
  }

  async function handleUploadChange(files: FileList | null) {
    if (uploadTargetIndex === null || !files || files.length === 0) return
    const photo = await fileToSquareDataUrl(files[0])
    if (photo) {
      replacePhoto(uploadTargetIndex, photo)
    }
    setUploadTargetIndex(null)
  }

  const selected = state.stickers.find((s) => s.id === selectedSticker)

  return (
    <main className="min-h-dvh bg-paper-grid pb-16">
      <SiteNav />

      <section className="mx-auto max-w-6xl px-5 pt-10">
        <div className="relative flex flex-col items-center gap-4 text-center md:block mb-8">
          <div className="flex justify-start md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground hover:bg-muted"
            >
              <ChevronLeft className="size-4" /> Back
            </Link>
          </div>
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {hasPhotos ? "Decorate your strip" : "Step into the booth❤️"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              {hasPhotos
                ? "Pick a filter, choose a frame, and drag cute stickers onto your strip."
                : "Choose a filter, then take four photos. We'll stitch them into a cute strip."}
            </p>
          </div>
        </div>

        {!hasPhotos ? (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_280px]">
            <CameraCapture filter={state.filter} onComplete={setPhotos} shots={SHOTS} />

            {/* filter picker (pre-capture) */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <Sparkles className="size-4 text-primary" /> Live filter
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                See it on the live preview before you snap.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                      state.filter === f.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
            {/* live strip preview */}
            <div className="flex flex-col items-center gap-4">
              <PhotoStrip
                photos={state.photos}
                filter={state.filter}
                frame={state.frame}
                stickers={state.stickers}
                caption={state.caption}
                date={state.date}
                editable
                selectedStickerId={selectedSticker}
                onSelectSticker={setSelectedSticker}
                onUpdateSticker={updateSticker}
                onRemoveSticker={removeSticker}
              />
              <button
                onClick={() => {
                  setPhotos([])
                  setStickers([])
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" /> Retake photos
              </button>
            </div>

            {/* editor controls */}
            <div className="flex flex-col gap-5">
              {/* caption */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <label
                  htmlFor="caption"
                  className="font-heading text-lg font-semibold"
                >
                  Caption
                </label>
                <input
                  id="caption"
                  value={state.caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 28))}
                  placeholder="add a little caption…"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* filters */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-heading text-lg font-semibold">Filter</h2>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                        state.filter === f.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold">Photos</h2>
                  <p className="text-xs text-muted-foreground">Slot by slot.</p>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {Array.from({ length: SHOTS }).map((_, index) => {
                    const src = state.photos[index]
                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-border bg-background"
                      >
                        <div className="relative aspect-square bg-muted/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src || "/placeholder.svg"}
                            alt={`Photo slot ${index + 1}`}
                            className="size-full object-cover"
                            draggable={false}
                          />
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground shadow">
                            {index + 1}
                          </span>
                        </div>
                        <div className="grid gap-1 p-1.5">
                          <button
                            onClick={() => setEditingPhotoIndex(index)}
                            className="rounded-full border border-border bg-card px-2 py-1 text-[10px] font-medium hover:bg-muted"
                          >
                            Retake
                          </button>
                          <button
                            onClick={() => requestUpload(index)}
                            className="rounded-full border border-border bg-card px-2 py-1 text-[10px] font-medium hover:bg-muted"
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {!allPhotosFilled && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Fill all four slots before downloading.
                  </p>
                )}
              </div>

              {/* frames */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-heading text-lg font-semibold">Frame</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrame(f.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        state.frame === f.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{ backgroundColor: f.bg }}
                      />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* stickers */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-heading text-lg font-semibold">Stickers</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap to add, then drag to position on your strip.
                </p>
                <div className="mt-3 grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                  {STICKER_SET.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addSticker(emoji)}
                      className="grid aspect-square place-items-center rounded-lg text-xl transition-transform hover:scale-110 hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* selected sticker controls */}
                {selected && (
                  <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                    <p className="text-sm font-medium">
                      Adjust {selected.emoji}
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      <label className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-12">Size</span>
                        <input
                          type="range"
                          min={0.5}
                          max={2.5}
                          step={0.05}
                          value={selected.scale}
                          onChange={(e) =>
                            updateSticker(selected.id, {
                              scale: Number(e.target.value),
                            })
                          }
                          className="flex-1 accent-[var(--primary)]"
                        />
                      </label>
                      <label className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-12">Rotate</span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={selected.rotation}
                          onChange={(e) =>
                            updateSticker(selected.id, {
                              rotation: Number(e.target.value),
                            })
                          }
                          className="flex-1 accent-[var(--primary)]"
                        />
                      </label>
                      <button
                        onClick={() => removeSticker(selected.id)}
                        className="self-start rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                      >
                        Remove sticker
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/download")}
                disabled={!allPhotosFilled}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
              >
                Looks cute — continue
                <ArrowRight className="size-5" />
              </button>
              {!allPhotosFilled && (
                <p className="text-center text-sm text-muted-foreground">
                  Continue is enabled once every slot has a photo.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {editingPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold">
                  Retake slot {editingPhotoIndex + 1}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Capture one new photo and it will replace this slot only.
                </p>
              </div>
              <button
                onClick={() => setEditingPhotoIndex(null)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Close
              </button>
            </div>
            <div className="mt-5">
              <CameraCapture
                filter={state.filter}
                shots={1}
                onComplete={(photos) => {
                  if (photos[0]) {
                    replacePhoto(editingPhotoIndex, photos[0])
                  }
                  setEditingPhotoIndex(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleUploadChange(e.target.files)
          e.target.value = ""
        }}
      />
    </main>
  )
}
