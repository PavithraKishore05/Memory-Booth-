"use client"

import {
  useRef, useState, useCallback, useEffect,
} from "react"
import {
  Type, Smile, ImagePlus,
  ChevronDown, Trash2, Download,
  Minus, Plus, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { SiteNav } from "@/components/site-nav"
import { renderJournalToCanvas } from "@/lib/render-journal"
import {
  JOURNAL_TEMPLATES,
  FONT_OPTIONS,
  EMOJI_LIST,
  STICKER_LIST,
  type JournalEl,
  type TextEl,
  type StickerEl,
  type ImageEl,
  type JournalTemplate,
} from "@/lib/memory-book-types"
import { cn } from "@/lib/utils"

// ─── ID util ────────────────────────────────────────────────────────────────
let _id = 1
const uid = () => `el-${_id++}`

// ─── Canvas dimensions ───────────────────────────────────────────────────────
const CW = 680   // canvas width
const CH = 500   // canvas height  — smaller, landscape-ish journal page
const DECORATION_EMOJIS = Array.from(
  new Set([...EMOJI_LIST, ...STICKER_LIST.map((s) => s.emoji)])
)

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MemoryBookPage() {
  const [template, setTemplate] = useState<JournalTemplate>(JOURNAL_TEMPLATES[0])
  const [elements, setElements] = useState<JournalEl[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [showMoreStickers, setShowMoreStickers] = useState(false)
  const [editRequestId, setEditRequestId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selected = elements.find((e) => e.id === selectedId) ?? null
  const maxZ = elements.reduce((m, e) => Math.max(m, e.z), 0)

  const add = useCallback((el: JournalEl) => {
    setElements((p) => [...p, el])
    setSelectedId(el.id)
  }, [])

  const update = useCallback((id: string, patch: Partial<JournalEl>) => {
    setElements((p) => p.map((e) => e.id === id ? { ...e, ...patch } as JournalEl : e))
  }, [])

  const remove = useCallback((id: string) => {
    setElements((p) => p.filter((e) => e.id !== id))
    setSelectedId(null)
  }, [])

  const addText = () => {
    const el: TextEl = {
      id: uid(), kind: "text",
      x: 80, y: 60 + elements.length * 28,
      w: 220, h: 56, rotation: 0, z: maxZ + 1,
      content: "Your text here",
      fontFamily: FONT_OPTIONS[0].value,
      fontSize: 24, color: template.defaultTextColor,
      align: "left", bold: false, italic: false, underline: false,
    }
    add(el)
    setEditRequestId(el.id)
  }

  const addSticker = (emoji: string) => {
    const el: StickerEl = {
      id: uid(), kind: "sticker",
      x: 40 + Math.random() * (CW - 120),
      y: 30 + Math.random() * (CH - 100),
      w: 56, h: 56, rotation: Math.random() * 30 - 15,
      z: maxZ + 1, emoji, fontSize: 40,
    }
    add(el)
  }

  const addImage = (src: string) => {
    const el: ImageEl = {
      id: uid(), kind: "image",
      x: 60, y: 40 + elements.length * 16,
      w: 180, h: 130, rotation: Math.random() * 10 - 5,
      z: maxZ + 1, src,
    }
    add(el)
  }

  const download = async () => {
    setDownloading(true)
    try {
      const url = await renderJournalToCanvas(elements, template, CW, CH)
      const a = document.createElement("a")
      a.href = url
      a.download = `memory-journal-${Date.now()}.jpg`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  const textEl = selected?.kind === "text" ? (selected as TextEl) : null

  return (
    <main className="min-h-dvh bg-paper-grid">
      <SiteNav />

      {/* ── Top bar ── */}
      <div className="relative mx-auto mt-4 max-w-[1200px] px-5 py-4 flex items-center justify-center">
        <Link
          href="/"
          className="absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight leading-tight sm:text-5xl">
            Memory Book <span className="text-primary">✦</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Your personal scrapbook journal</p>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="mx-auto mt-8 max-w-[1200px] px-5 pb-10 flex gap-8 items-start">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-56 shrink-0 flex flex-col gap-3">

          {/* Text section */}
          <SideSection
            icon={<Type className="size-4 text-primary" />}
            label="Text"
            accent
          >
            {/* Font family */}
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                value={textEl?.fontFamily ?? FONT_OPTIONS[0].value}
                onChange={(e) => textEl && update(textEl.id, { fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-muted-foreground" />
            </div>

            {/* Size row */}
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => textEl && update(textEl.id, { fontSize: Math.max(8, textEl.fontSize - 2) })}
                className="grid size-8 place-items-center rounded-lg border border-border bg-background hover:bg-muted"
              ><Minus className="size-3.5" /></button>
              <span className="flex-1 rounded-lg border border-border bg-background py-1.5 text-center text-sm font-medium tabular-nums">
                {textEl?.fontSize ?? 24}
              </span>
              <button
                onClick={() => textEl && update(textEl.id, { fontSize: Math.min(96, textEl.fontSize + 2) })}
                className="grid size-8 place-items-center rounded-lg border border-border bg-background hover:bg-muted"
              ><Plus className="size-3.5" /></button>
              <label className="grid size-8 place-items-center cursor-pointer rounded-lg border border-border overflow-hidden">
                <input
                  type="color"
                  value={textEl?.color ?? "#2c1a0e"}
                  onChange={(e) => textEl && update(textEl.id, { color: e.target.value })}
                  className="h-8 w-8 cursor-pointer scale-150"
                />
              </label>
            </div>

            {/* Style row */}
            <div className="flex items-center gap-1 mt-1">
              <StyleBtn
                active={!!textEl?.bold}
                onClick={() => textEl && update(textEl.id, { bold: !textEl.bold })}
              ><Bold className="size-3.5" /></StyleBtn>
              <StyleBtn
                active={!!textEl?.italic}
                onClick={() => textEl && update(textEl.id, { italic: !textEl.italic })}
              ><Italic className="size-3.5" /></StyleBtn>
              <StyleBtn
                active={!!textEl?.underline}
                onClick={() => textEl && update(textEl.id, { underline: !textEl.underline })}
              ><Underline className="size-3.5" /></StyleBtn>
              <StyleBtn
                active={false}
                onClick={() => {}}
                className="ml-auto opacity-30 cursor-default"
              ><span className="text-xs font-medium">Aa</span></StyleBtn>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 mt-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => textEl && update(textEl.id, { align: a })}
                  className={cn(
                    "grid flex-1 place-items-center rounded-lg border py-1.5 transition-colors",
                    textEl?.align === a
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {a === "left" ? <AlignLeft className="size-3.5" /> : a === "center" ? <AlignCenter className="size-3.5" /> : <AlignRight className="size-3.5" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (textEl) remove(textEl.id) }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="size-3" /> Delete Text
            </button>

            <button
              onClick={addText}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Type className="size-3" /> Add Text
            </button>
          </SideSection>

          {/* Emoji + stickers section */}
          <SideSection
            icon={<Smile className="size-4 text-primary" />}
            label="Emoji & Stickers"
            accent
          >
            <div>
              <div className="grid grid-cols-6 gap-1">
                {(showMoreStickers ? DECORATION_EMOJIS : DECORATION_EMOJIS.slice(0, 20)).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addSticker(emoji)}
                    className="grid size-8 place-items-center rounded-lg border border-border bg-background text-lg transition-all hover:bg-muted hover:scale-110"
                  >{emoji}</button>
                ))}
              </div>
              <button
                onClick={() => setShowMoreStickers((v) => !v)}
                className="mt-1 w-full py-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {showMoreStickers ? "Show Less" : "View More"}
              </button>
            </div>
          </SideSection>

          {/* Photo section */}
          <SideSection
            icon={<ImagePlus className="size-4 text-primary" />}
            label="Photo"
            accent
          >
            <label className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-border bg-background py-4 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5">
              <ImagePlus className="size-5 text-muted-foreground" />
              <span className="font-medium">Upload Photo</span>
              <span className="text-[10px]">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const r = new FileReader()
                  r.onload = (ev) => addImage(ev.target?.result as string)
                  r.readAsDataURL(f)
                  e.target.value = ""
                }}
              />
            </label>
          </SideSection>

        </aside>

        {/* ── CENTRE: Canvas ── */}
        <div className="flex flex-1 flex-col items-center gap-4">
          <JournalCanvas
            ref={canvasRef}
            template={template}
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={update}
            onDelete={remove}
            editRequestId={editRequestId}
            width={CW}
            height={CH}
          />

          {/* Template switcher */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {JOURNAL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all",
                  template.id === t.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                <span
                  className="size-5 rounded-md border border-border/40 shadow-sm"
                  style={{
                    backgroundImage: `url(${t.src})`,
                    backgroundSize: "cover",
                    display: "inline-block",
                  }}
                />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => { setElements([]); setSelectedId(null) }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:text-foreground transition-colors"
            >
              <Trash2 className="size-3.5" /> Clear All
            </button>
            <button
              onClick={download}
              disabled={downloading}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-70"
            >
              <Download className="size-4" />
              {downloading ? "Saving…" : "Download Image"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Add text to type immediately. Drag to move. Use corner handles to resize.
          </p>
        </div>

      </div>
    </main>
  )
}

// ─── Side Section ─────────────────────────────────────────────────────────────
function SideSection({
  icon, label, children, accent,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-0.5">
        {icon}
        <span className={cn("text-sm font-semibold", accent && "text-primary")}>{label}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Style Button ─────────────────────────────────────────────────────────────
function StyleBtn({
  active, onClick, children, className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg border transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── Journal Canvas ───────────────────────────────────────────────────────────
import React from "react"

const JournalCanvas = React.forwardRef<
  HTMLDivElement,
  {
    template: JournalTemplate
    elements: JournalEl[]
    selectedId: string | null
    onSelect: (id: string | null) => void
    onUpdate: (id: string, patch: Partial<JournalEl>) => void
    onDelete: (id: string) => void
    editRequestId: string | null
    width: number
    height: number
  }
>(function JournalCanvas({ template, elements, selectedId, onSelect, onUpdate, onDelete, editRequestId, width, height }, ref) {
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number; ex: number; ey: number } | null>(null)
  const [resize, setResize] = useState<{ id: string; ox: number; oy: number; ow: number; oh: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!editRequestId) return
    const next = elements.find((el) => el.id === editRequestId)
    if (next?.kind === "text") {
      setEditingId(editRequestId)
    }
  }, [editRequestId, elements])

  const onMouseMove = (e: React.MouseEvent) => {
    if (drag) {
      onUpdate(drag.id, { x: drag.ex + (e.clientX - drag.ox), y: drag.ey + (e.clientY - drag.oy) })
    }
    if (resize) {
      onUpdate(resize.id, {
        w: Math.max(40, resize.ow + (e.clientX - resize.ox)),
        h: Math.max(20, resize.oh + (e.clientY - resize.oy)),
      })
    }
  }

  const stopAll = () => { setDrag(null); setResize(null) }

  const sorted = [...elements].sort((a, b) => a.z - b.z)

  return (
    <div
      ref={ref}
      className="relative rounded-xl shadow-2xl overflow-hidden select-none"
      style={{ width, height, backgroundImage: `url(${template.src})`, backgroundSize: "cover", backgroundPosition: "center" }}
      onMouseMove={onMouseMove}
      onMouseUp={stopAll}
      onMouseLeave={stopAll}
      onClick={() => { onSelect(null); setEditingId(null) }}
    >
      {sorted.map((el) => (
        <CanvasElement
          key={el.id}
          el={el}
          selected={el.id === selectedId}
          editing={el.id === editingId}
          onMouseDown={(e) => {
            e.stopPropagation()
            onSelect(el.id)
            if (el.kind === "text" && (e.detail === 2 || el.id === editRequestId)) { setEditingId(el.id); return }
            setDrag({ id: el.id, ox: e.clientX, oy: e.clientY, ex: el.x, ey: el.y })
          }}
          onResizeDown={(e) => {
            e.stopPropagation()
            setResize({ id: el.id, ox: e.clientX, oy: e.clientY, ow: el.w, oh: el.h })
          }}
          onDelete={() => onDelete(el.id)}
          onTextChange={(v) => onUpdate(el.id, { content: v } as Partial<TextEl>)}
          onBlur={() => setEditingId(null)}
        />
      ))}
    </div>
  )
})

// ─── Canvas Element ───────────────────────────────────────────────────────────
function CanvasElement({
  el, selected, editing, onMouseDown, onResizeDown, onDelete, onTextChange, onBlur,
}: {
  el: JournalEl
  selected: boolean
  editing: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onResizeDown: (e: React.MouseEvent) => void
  onDelete: () => void
  onTextChange: (v: string) => void
  onBlur: () => void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (editing) taRef.current?.focus() }, [editing])

  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x, top: el.y,
    width: el.w, height: el.h,
    transform: `rotate(${el.rotation}deg)`,
    zIndex: el.z,
    cursor: "grab",
    userSelect: "none",
  }

  const ring = selected
    ? { outline: "2px dashed rgba(224,100,80,0.85)", outlineOffset: 2 }
    : {}

  if (el.kind === "text") {
    const t = el as TextEl
    const css: React.CSSProperties = {
      fontFamily: t.fontFamily,
      fontSize: t.fontSize,
      color: t.color,
      textAlign: t.align,
      fontWeight: t.bold ? "bold" : "normal",
      fontStyle: t.italic ? "italic" : "normal",
      textDecoration: t.underline ? "underline" : "none",
      lineHeight: 1.45,
      whiteSpace: "pre-wrap",
      width: "100%", height: "100%",
    }
    return (
      <div style={{ ...base, ...ring }} onMouseDown={onMouseDown}>
        {editing ? (
          <textarea
            ref={taRef}
            style={{ ...css, background: "transparent", border: "none", outline: "none", resize: "none", cursor: "text", caretColor: t.color }}
            className="w-full h-full"
            value={t.content}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div style={css}>{t.content}</div>
        )}
        {selected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute -top-3 left-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-red-100"
          >
            Delete
          </button>
        )}
        {selected && <ResizeHandle onMouseDown={onResizeDown} />}
      </div>
    )
  }

  if (el.kind === "sticker") {
    const s = el as StickerEl
    return (
      <div
        style={{ ...base, ...ring, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s.fontSize }}
        onMouseDown={onMouseDown}
      >
        {s.emoji}
        {selected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute -top-3 left-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-red-100"
          >
            Delete
          </button>
        )}
        {selected && <ResizeHandle onMouseDown={onResizeDown} />}
      </div>
    )
  }

  if (el.kind === "image") {
    const img = el as ImageEl
    return (
      <div style={{ ...base, ...ring }} onMouseDown={onMouseDown}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} draggable={false} />
        {selected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute -top-3 left-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-red-100"
          >
            Delete
          </button>
        )}
        {selected && <ResizeHandle onMouseDown={onResizeDown} />}
      </div>
    )
  }

  return null
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="absolute bottom-0 right-0 size-3.5 rounded-full bg-primary border-2 border-white shadow cursor-se-resize"
      style={{ transform: "translate(50%, 50%)", zIndex: 9999 }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
    />
  )
}
