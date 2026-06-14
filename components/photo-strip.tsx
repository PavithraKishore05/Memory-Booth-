"use client"

import { useRef, useState, type PointerEvent } from "react"
import { X } from "lucide-react"
import {
  FILTERS,
  FRAMES,
  type FilterId,
  type FrameId,
  type PlacedSticker,
} from "@/lib/booth-types"
import { cn } from "@/lib/utils"

type Props = {
  photos: string[]
  filter: FilterId
  frame: FrameId
  stickers: PlacedSticker[]
  caption: string
  date: string
  editable?: boolean
  selectedStickerId?: string | null
  onSelectSticker?: (id: string | null) => void
  onUpdateSticker?: (id: string, patch: Partial<PlacedSticker>) => void
  onRemoveSticker?: (id: string) => void
}

export function PhotoStrip({
  photos,
  filter,
  frame,
  stickers,
  caption,
  date,
  editable = false,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  onRemoveSticker,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(
    null,
  )
  const [dragging, setDragging] = useState<string | null>(null)

  const filterCss = FILTERS.find((f) => f.id === filter)?.css ?? "none"
  const frameDef = FRAMES.find((f) => f.id === frame) ?? FRAMES[0]
  const isFilm = frame === "film"

  function handlePointerDown(e: PointerEvent, sticker: PlacedSticker) {
    if (!editable) return
    e.stopPropagation()
    onSelectSticker?.(sticker.id)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragState.current = {
      id: sticker.id,
      offsetX: e.clientX - (rect.left + sticker.x * rect.width),
      offsetY: e.clientY - (rect.top + sticker.y * rect.height),
    }
    setDragging(sticker.id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragState.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - dragState.current.offsetX - rect.left) / rect.width
    const y = (e.clientY - dragState.current.offsetY - rect.top) / rect.height
    onUpdateSticker?.(dragState.current.id, {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    })
  }

  function handlePointerUp() {
    dragState.current = null
    setDragging(null)
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerDown={() => editable && onSelectSticker?.(null)}
      className="relative mx-auto w-[240px] select-none rounded-md p-2.5 shadow-2xl"
      style={{
        backgroundColor: frameDef.bg,
        color: frameDef.text,
        touchAction: editable ? "none" : "auto",
      }}
    >
      <div className="flex flex-col gap-2.5">
        {photos.map((src, i) => (
          <div
            key={i}
            className={cn(
              "relative overflow-hidden",
              isFilm ? "rounded-none" : "rounded-sm",
            )}
          >
            {isFilm && (
              <>
                <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-3 flex-col justify-around">
                  {Array.from({ length: 6 }).map((_, k) => (
                    <span
                      key={k}
                      className="mx-auto size-1.5 rounded-[1px] bg-background/80"
                    />
                  ))}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-3 flex-col justify-around">
                  {Array.from({ length: 6 }).map((_, k) => (
                    <span
                      key={k}
                      className="mx-auto size-1.5 rounded-[1px] bg-background/80"
                    />
                  ))}
                </span>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src || "/placeholder.svg"}
              alt={`Captured photo ${i + 1}`}
              className={cn("aspect-square w-full object-cover", isFilm && "px-3")}
              style={{ filter: filterCss }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* caption / date footer */}
      <div className="mt-3 px-1 pb-1 text-center">
        <p className="font-handwriting text-lg leading-tight">
          {caption || "Polaroid Booth"}
        </p>
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] opacity-70">
          {date}
        </p>
      </div>

      {/* stickers layer */}
      {stickers.map((sticker) => {
        const selected = editable && selectedStickerId === sticker.id
        return (
          <div
            key={sticker.id}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            className={cn(
              "absolute z-20 leading-none",
              editable && "cursor-grab",
              dragging === sticker.id && "cursor-grabbing",
            )}
            style={{
              left: `${sticker.x * 100}%`,
              top: `${sticker.y * 100}%`,
              fontSize: `${sticker.scale * 2.5}rem`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
            }}
          >
            <span className="relative inline-block drop-shadow">
              {sticker.emoji}
              {selected && (
                <>
                  <span className="pointer-events-none absolute -inset-2 rounded-md border-2 border-dashed border-primary" />
                  <button
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onRemoveSticker?.(sticker.id)
                    }}
                    className="absolute -right-3 -top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow"
                    style={{ fontSize: "0.7rem" }}
                    aria-label="Remove sticker"
                  >
                    <X className="size-3" />
                  </button>
                </>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
