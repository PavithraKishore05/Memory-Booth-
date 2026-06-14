"use client"

import { useState } from "react"
import { Type, Smile, ImagePlus, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  TextElement,
  JournalElement,
  FontFamily,
} from "@/lib/memory-book-types"
import {
  JOURNAL_STICKERS,
  FONT_FAMILIES,
  FONT_LABELS,
} from "@/lib/memory-book-types"

interface JournalToolbarProps {
  selected: JournalElement | null
  onAddText: () => void
  onAddSticker: (emoji: string) => void
  onAddImage: (src: string) => void
  onUpdateSelected: (changes: Partial<JournalElement>) => void
  onDelete: () => void
  onBringForward: () => void
  onSendBackward: () => void
}

type Panel = "none" | "emoji" | "stickers" | "font"

export function JournalToolbar({
  selected,
  onAddText,
  onAddSticker,
  onAddImage,
  onUpdateSelected,
  onDelete,
  onBringForward,
  onSendBackward,
}: JournalToolbarProps) {
  const [panel, setPanel] = useState<Panel>("none")

  const togglePanel = (p: Panel) => setPanel((prev) => (prev === p ? "none" : p))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      onAddImage(src)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const textEl = selected?.type === "text" ? (selected as TextElement) : null

  return (
    <div className="flex flex-col gap-3">
      {/* Main action buttons */}
      <div className="flex flex-wrap gap-2">
        <ToolBtn icon={<Type className="size-4" />} label="Text" onClick={onAddText} />
        <ToolBtn
          icon={<Smile className="size-4" />}
          label="Emoji"
          onClick={() => togglePanel("emoji")}
          active={panel === "emoji"}
        />
        <label className="inline-flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground">
          <ImagePlus className="size-4" />
          Photo
          <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
        </label>
        <ToolBtn
          icon={<Sparkles className="size-4" />}
          label="Stickers"
          onClick={() => togglePanel("stickers")}
          active={panel === "stickers"}
        />
        {textEl && (
          <ToolBtn
            icon={<ChevronDown className="size-4" />}
            label="Font"
            onClick={() => togglePanel("font")}
            active={panel === "font"}
          />
        )}
      </div>

      {/* Emoji panel */}
      {panel === "emoji" && (
        <EmojiGrid onPick={(e) => { onAddSticker(e); setPanel("none") }} />
      )}

      {/* Sticker panel */}
      {panel === "stickers" && (
        <StickerGrid onPick={(e) => { onAddSticker(e); setPanel("none") }} />
      )}

      {/* Font controls panel */}
      {panel === "font" && textEl && (
        <FontControls
          el={textEl}
          onUpdate={(changes) => onUpdateSelected(changes as Partial<JournalElement>)}
        />
      )}

      {/* Selected element controls */}
      {selected && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">Selected:</span>
          <button
            onClick={onBringForward}
            className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            ↑ Forward
          </button>
          <button
            onClick={onSendBackward}
            className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            ↓ Backward
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function ToolBtn({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

const EMOJI_SET = [
  "😊","😍","🥰","😂","🤩","😎","🥺","😇","🎉","💯",
  "👏","🙌","💪","✌️","🤞","🫶","💅","🤳","👀","💀",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","❤️‍🔥","💔",
]

function EmojiGrid({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Emojis</p>
      <div className="grid grid-cols-10 gap-1">
        {EMOJI_SET.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="rounded text-lg hover:scale-125 transition-transform"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

function StickerGrid({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Aesthetic Stickers</p>
      <div className="grid grid-cols-10 gap-1">
        {JOURNAL_STICKERS.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="rounded text-lg hover:scale-125 transition-transform"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

function FontControls({
  el,
  onUpdate,
}: {
  el: TextElement
  onUpdate: (changes: Partial<TextElement>) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">Font Controls</p>

      {/* Font family */}
      <div className="flex flex-wrap gap-1.5">
        {FONT_FAMILIES.map((f) => (
          <button
            key={f}
            onClick={() => onUpdate({ fontFamily: f as FontFamily })}
            style={{ fontFamily: f }}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs transition-all",
              el.fontFamily === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted text-foreground hover:bg-accent"
            )}
          >
            {FONT_LABELS[f as FontFamily]}
          </button>
        ))}
      </div>

      {/* Size, color, weight, align */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Size
          <input
            type="number"
            min={8}
            max={96}
            value={el.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-14 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Color
          <input
            type="color"
            value={el.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border border-border"
          />
        </label>

        <button
          onClick={() => onUpdate({ bold: !el.bold })}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs font-bold transition-all",
            el.bold ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted"
          )}
        >
          B
        </button>
        <button
          onClick={() => onUpdate({ italic: !el.italic })}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs italic transition-all",
            el.italic ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted"
          )}
        >
          I
        </button>

        {(["left", "center", "right"] as const).map((a) => (
          <button
            key={a}
            onClick={() => onUpdate({ align: a })}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs transition-all",
              el.align === a ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted"
            )}
          >
            {a === "left" ? "⬅" : a === "center" ? "⬛" : "➡"}
          </button>
        ))}
      </div>
    </div>
  )
}
