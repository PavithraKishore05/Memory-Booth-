"use client"

import {
  useRef, useState, useCallback, useEffect,
} from "react"
import {
  Type, Smile, ImagePlus,
  ChevronDown, Trash2, Download,
  Minus, Plus, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, ChevronLeft,
  RotateCw,
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
      <div className="relative mx-auto mt-4 max-w-[1200px] px-5 py-4 flex flex-col sm:flex-row items-center justify-between sm:justify-center gap-3 w-full">
        <Link
          href="/"
          className="sm:absolute sm:left-5 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
        <div className="text-center">
          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Memory Book <span className="text-primary">✦</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Your personal scrapbook journal</p>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="mx-auto mt-4 max-w-[1200px] px-4 pb-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start w-full">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full lg:w-56 shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-3">

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
        <div className="flex flex-1 flex-col items-center gap-4 w-full">
          <JournalCanvas
            ref={canvasRef}
            template={template}
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={update}
            onDelete={remove}
            editRequestId={editRequestId}
            onClearEditRequest={() => setEditRequestId(null)}
            width={CW}
            height={CH}
          />

          {/* Template switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {JOURNAL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-xl border-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all",
                  template.id === t.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                <span
                  className="size-4 sm:size-5 rounded-md border border-border/40 shadow-sm shrink-0"
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
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground shadow-sm hover:text-foreground transition-colors"
            >
              <Trash2 className="size-3.5" /> Clear All
            </button>
            <button
              onClick={download}
              disabled={downloading}
              className="flex items-center gap-2 rounded-full bg-primary px-4.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-70"
            >
              <Download className="size-4" />
              {downloading ? "Saving…" : "Download Image"}
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            💡 <strong>Tip:</strong> Add text to type immediately. Drag to move. Use handles to resize or rotate.
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

// Helper to rotate cursors based on angle
function getResizeCursor(handle: string, rotationDeg: number): string {
  const baseAngles: Record<string, number> = {
    n: 0, ne: 45, e: 90, se: 135,
    s: 180, sw: 225, w: 270, nw: 315
  }
  const baseAngle = baseAngles[handle] ?? 0
  const angle = (baseAngle + rotationDeg) % 360
  const normalizedAngle = angle < 0 ? angle + 360 : angle
  
  // Find closest angle in steps of 45
  const index = Math.round(normalizedAngle / 45) % 8
  const cursors = [
    "ns-resize",   // 0
    "nesw-resize", // 45
    "ew-resize",   // 90
    "nwse-resize", // 135
    "ns-resize",   // 180
    "nesw-resize", // 225
    "ew-resize",   // 270
    "nwse-resize"  // 315
  ]
  return cursors[index]
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
    onClearEditRequest: () => void
    width: number
    height: number
  }
>(function JournalCanvas({ template, elements, selectedId, onSelect, onUpdate, onDelete, editRequestId, onClearEditRequest, width, height }, ref) {
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number; ex: number; ey: number } | null>(null)
  
  const [resize, setResize] = useState<{
    id: string
    handle: string
    ox: number
    oy: number
    ow: number
    oh: number
    ox_el: number
    oy_el: number
    rotation: number
  } | null>(null)

  const [rotate, setRotate] = useState<{
    id: string
    cx: number
    cy: number
    startAngle: number
    startRotation: number
  } | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  
  const localRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  React.useImperativeHandle(ref, () => localRef.current!)

  // Measure and adjust scale factor relative to design width
  useEffect(() => {
    if (!containerRef.current) return
    const updateScale = () => {
      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? width
      if (containerWidth < width) {
        setScale(containerWidth / width)
      } else {
        setScale(1)
      }
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [width])

  // Handle edit request (e.g. from adding a new text element)
  useEffect(() => {
    if (!editRequestId) return
    const next = elements.find((el) => el.id === editRequestId)
    if (next?.kind === "text") {
      setEditingId(editRequestId)
    }
    onClearEditRequest()
  }, [editRequestId, elements, onClearEditRequest])

  // Global window listeners for drag/resize/rotate actions (mouse & touch)
  useEffect(() => {
    if (!drag && !resize && !rotate) return

    const handleMove = (clientX: number, clientY: number, shiftKey: boolean) => {
      if (drag) {
        onUpdate(drag.id, {
          x: drag.ex + (clientX - drag.ox) / scale,
          y: drag.ey + (clientY - drag.oy) / scale,
        })
      } else if (resize) {
        const alpha = (resize.rotation * Math.PI) / 180
        const ux = [Math.cos(alpha), Math.sin(alpha)]
        const uy = [-Math.sin(alpha), Math.cos(alpha)]

        const dx = clientX - resize.ox
        const dy = clientY - resize.oy

        // Project delta onto local axes and adjust by scale
        const dxLocal = (dx * ux[0] + dy * ux[1]) / scale
        const dyLocal = (dx * uy[0] + dy * uy[1]) / scale

        let dw = 0
        let dh = 0
        let xMult = 0
        let yMult = 0

        switch (resize.handle) {
          case "e":
            dw = dxLocal
            xMult = 0.5
            break
          case "w":
            dw = -dxLocal
            xMult = -0.5
            break
          case "s":
            dh = dyLocal
            yMult = 0.5
            break
          case "n":
            dh = -dyLocal
            yMult = -0.5
            break
          case "se":
            dw = dxLocal
            dh = dyLocal
            xMult = 0.5
            yMult = 0.5
            break
          case "sw":
            dw = -dxLocal
            dh = dyLocal
            xMult = -0.5
            yMult = 0.5
            break
          case "ne":
            dw = dxLocal
            dh = -dyLocal
            xMult = 0.5
            yMult = -0.5
            break
          case "nw":
            dw = -dxLocal
            dh = -dyLocal
            xMult = -0.5
            yMult = -0.5
            break
        }

        // Clamp minimum size to prevent flipping/too small elements
        const minW = 20
        const minH = 20
        const newW = Math.max(minW, resize.ow + dw)
        const newH = Math.max(minH, resize.oh + dh)

        const dwApplied = newW - resize.ow
        const dhApplied = newH - resize.oh

        // Calculate starting center of the element
        const cxStart = resize.ox_el + resize.ow / 2
        const cyStart = resize.oy_el + resize.oh / 2

        // Shift center in local coordinates
        const cxShiftLocal = dwApplied * xMult
        const cyShiftLocal = dhApplied * yMult

        // Convert center shift back to world space
        const cxNew = cxStart + (cxShiftLocal * ux[0] - cyShiftLocal * ux[1])
        const cyNew = cyStart + (cxShiftLocal * ux[1] + cyShiftLocal * ux[0])

        onUpdate(resize.id, {
          w: newW,
          h: newH,
          x: cxNew - newW / 2,
          y: cyNew - newH / 2,
        })
      } else if (rotate) {
        const thetaCur = Math.atan2(clientY - rotate.cy, clientX - rotate.cx)
        const deltaThetaRad = thetaCur - rotate.startAngle
        let newRotation = rotate.startRotation + Math.round((deltaThetaRad * 180) / Math.PI)

        // Snapping support: holding Shift snaps to nearest 45 degrees
        if (shiftKey) {
          newRotation = Math.round(newRotation / 45) * 45
        }

        // Normalize angle to [-180, 180]
        newRotation = ((newRotation + 180) % 360) - 180
        if (newRotation < -180) newRotation += 360

        onUpdate(rotate.id, { rotation: newRotation })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY, e.shiftKey)
    }

    const handleMouseUp = () => {
      setDrag(null)
      setResize(null)
      setRotate(null)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      if (e.touches.length === 0) return
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY, e.shiftKey)
    }

    const handleTouchEnd = () => {
      setDrag(null)
      setResize(null)
      setRotate(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchcancel", handleTouchEnd)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [drag, resize, rotate, scale, onUpdate])

  const sorted = [...elements].sort((a, b) => a.z - b.z)

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-start overflow-hidden relative"
      style={{ height: height * scale }}
    >
      <div
        ref={localRef}
        className="relative rounded-xl shadow-2xl overflow-hidden select-none shrink-0"
        style={{
          width,
          height,
          backgroundImage: `url(${template.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
        onClick={() => { onSelect(null); setEditingId(null) }}
      >
        {sorted.map((el) => (
          <CanvasElement
            key={el.id}
            el={el}
            selected={el.id === selectedId}
            editing={el.id === editingId}
            scale={scale}
            onMouseDown={(e) => {
              e.stopPropagation()
              onSelect(el.id)
              if (el.kind === "text" && e.detail === 2) {
                setEditingId(el.id)
                return
              }
              if (editingId !== el.id) {
                setEditingId(null)
              }
              setDrag({ id: el.id, ox: e.clientX, oy: e.clientY, ex: el.x, ey: el.y })
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              onSelect(el.id)
              if (el.kind === "text" && editingId === el.id) return
              if (editingId !== el.id) {
                setEditingId(null)
              }
              if (e.touches.length === 0) return
              const touch = e.touches[0]
              setDrag({ id: el.id, ox: touch.clientX, oy: touch.clientY, ex: el.x, ey: el.y })
            }}
            onResizeDown={(handle, clientX, clientY) => {
              setResize({
                id: el.id,
                handle,
                ox: clientX,
                oy: clientY,
                ow: el.w,
                oh: el.h,
                ox_el: el.x,
                oy_el: el.y,
                rotation: el.rotation,
              })
            }}
            onRotateDown={(clientX, clientY) => {
              const rect = localRef.current?.getBoundingClientRect()
              if (!rect) return
              const cx = rect.left + (el.x + el.w / 2) * scale
              const cy = rect.top + (el.y + el.h / 2) * scale
              const startAngle = Math.atan2(clientY - cy, clientX - cx)
              setRotate({
                id: el.id,
                cx,
                cy,
                startAngle,
                startRotation: el.rotation,
              })
            }}
            onDelete={() => onDelete(el.id)}
            onTextChange={(v) => onUpdate(el.id, { content: v } as Partial<TextEl>)}
            onBlur={() => setEditingId(null)}
          />
        ))}
      </div>
    </div>
  )
})

// ─── Canvas Element ───────────────────────────────────────────────────────────
function CanvasElement({
  el,
  selected,
  editing,
  scale,
  onMouseDown,
  onTouchStart,
  onResizeDown,
  onRotateDown,
  onDelete,
  onTextChange,
  onBlur,
}: {
  el: JournalEl
  selected: boolean
  editing: boolean
  scale: number
  onMouseDown: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onResizeDown: (handle: string, clientX: number, clientY: number) => void
  onRotateDown: (clientX: number, clientY: number) => void
  onDelete: () => void
  onTextChange: (v: string) => void
  onBlur: () => void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    transform: `rotate(${el.rotation}deg)`,
    zIndex: el.z,
    cursor: editing ? "text" : "grab",
    userSelect: "none",
  }

  const selectionOutline = selected ? (
    <>
      {/* Selection Border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${1.5 / scale}px solid #3b82f6`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Resize Handles (8 directions) */}
      {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((handle) => {
        const isCorner = ["nw", "ne", "se", "sw"].includes(handle)
        const handleTargetSize = 24
        
        let style: React.CSSProperties = {
          position: "absolute",
          width: handleTargetSize,
          height: handleTargetSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 11,
          pointerEvents: "auto",
          cursor: getResizeCursor(handle, el.rotation),
        }

        // Uniform centering transform using percentage coordinates
        if (handle === "nw") { style.top = "0%"; style.left = "0%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "n") { style.top = "0%"; style.left = "50%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "ne") { style.top = "0%"; style.left = "100%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "e") { style.top = "50%"; style.left = "100%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "se") { style.top = "100%"; style.left = "100%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "s") { style.top = "100%"; style.left = "50%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "sw") { style.top = "100%"; style.left = "0%"; style.transform = "translate(-50%, -50%)" }
        if (handle === "w") { style.top = "50%"; style.left = "0%"; style.transform = "translate(-50%, -50%)" }

        // Render visual handle centered inside the touch target box
        let visualStyle: React.CSSProperties = {
          backgroundColor: "#ffffff",
          border: `${1.5 / scale}px solid #3b82f6`,
          transform: `scale(${1 / scale})`,
          transformOrigin: "center center",
          boxSizing: "border-box",
        }

        if (isCorner) {
          visualStyle.width = 10
          visualStyle.height = 10
          visualStyle.borderRadius = "50%"
        } else {
          const isHorizontal = ["n", "s"].includes(handle)
          if (isHorizontal) {
            visualStyle.width = 16
            visualStyle.height = 6
            visualStyle.borderRadius = 3
          } else {
            visualStyle.width = 6
            visualStyle.height = 16
            visualStyle.borderRadius = 3
          }
        }

        return (
          <div
            key={handle}
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeDown(handle, e.clientX, e.clientY)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              if (e.touches.length === 0) return
              const touch = e.touches[0]
              onResizeDown(handle, touch.clientX, touch.clientY)
            }}
          >
            <div style={visualStyle} />
          </div>
        )
      })}

      {/* Rotation Connector Line */}
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1.5,
          height: 20,
          backgroundColor: "#3b82f6",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Rotation Handle wrapper with larger touch/hit target */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: "50%",
          transform: "translate(-50%, 0)",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          zIndex: 11,
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onRotateDown(e.clientX, e.clientY)
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
          if (e.touches.length === 0) return
          const touch = e.touches[0]
          onRotateDown(touch.clientX, touch.clientY)
        }}
        title="Drag to rotate (Hold Shift to snap)"
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: `${1.5 / scale}px solid #3b82f6`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transform: `scale(${1 / scale})`,
            transformOrigin: "center center",
          }}
        >
          <RotateCw className="size-3 text-blue-500" />
        </div>
      </div>

      {/* Floating Toolbar */}
      <div
        style={{
          position: "absolute",
          top: -48,
          left: "50%",
          transform: `translate(-50%, 0) rotate(${-el.rotation}deg)`,
          transformOrigin: "center bottom",
          display: "flex",
          alignItems: "center",
          gap: 4,
          backgroundColor: "#ffffff",
          border: "1.5px solid #e2e8f0",
          borderRadius: 8,
          padding: "4px 8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          zIndex: 100,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
          title="Delete element"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </>
  ) : null

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
      width: "100%",
      height: "100%",
      wordBreak: "break-word",
    }
    return (
      <div
        style={base}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <textarea
            ref={taRef}
            style={{
              ...css,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              cursor: "text",
              caretColor: t.color,
            }}
            className="w-full h-full"
            value={t.content}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div style={css} className="w-full h-full select-none">{t.content}</div>
        )}
        {selectionOutline}
      </div>
    )
  }

  if (el.kind === "sticker") {
    const s = el as StickerEl
    return (
      <div
        style={{
          ...base,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.fontSize,
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="select-none">{s.emoji}</div>
        {selectionOutline}
      </div>
    )
  }

  if (el.kind === "image") {
    const img = el as ImageEl
    return (
      <div
        style={base}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          draggable={false}
        />
        {selectionOutline}
      </div>
    )
  }

  return null
}
