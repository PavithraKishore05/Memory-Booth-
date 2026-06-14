"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import type {
  JournalElement,
  JournalTemplate,
  TextElement,
  StickerElement,
  ImageElement,
} from "@/lib/memory-book-types"

interface JournalCanvasProps {
  template: JournalTemplate
  elements: JournalElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, changes: Partial<JournalElement>) => void
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export function JournalCanvas({
  template,
  elements,
  selectedId,
  onSelect,
  onUpdate,
  canvasRef,
}: JournalCanvasProps) {
  const [dragging, setDragging] = useState<{
    id: string
    startX: number
    startY: number
    elX: number
    elY: number
  } | null>(null)

  const [resizing, setResizing] = useState<{
    id: string
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)

  const onMouseDown = useCallback(
    (e: React.MouseEvent, el: JournalElement) => {
      e.stopPropagation()
      onSelect(el.id)
      if (el.type === "text") {
        if (editingId === el.id) return
        if (e.detail === 2) {
        setEditingId(el.id)
        return
        }
      }
      setDragging({
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        elX: el.x,
        elY: el.y,
      })
    },
    [editingId, onSelect]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - dragging.startX
        const dy = e.clientY - dragging.startY
        onUpdate(dragging.id, { x: dragging.elX + dx, y: dragging.elY + dy })
      }
      if (resizing) {
        const dx = e.clientX - resizing.startX
        const dy = e.clientY - resizing.startY
        onUpdate(resizing.id, {
          width: Math.max(40, resizing.startW + dx),
          height: Math.max(20, resizing.startH + dy),
        })
      }
    },
    [dragging, resizing, onUpdate]
  )

  const onMouseUp = useCallback(() => {
    setDragging(null)
    setResizing(null)
  }, [])

  const onResizeMouseDown = (e: React.MouseEvent, el: JournalElement) => {
    e.stopPropagation()
    setResizing({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.width,
      startH: el.height,
    })
  }

  return (
    <div
      ref={canvasRef}
      className="relative overflow-hidden rounded-lg shadow-2xl select-none"
      style={{
        width: 560,
        height: 760,
        backgroundImage: `url(${template.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: dragging ? "grabbing" : "default",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={() => {
        onSelect(null)
        setEditingId(null)
      }}
    >
      {elements.map((el) => (
        <ElementRenderer
          key={el.id}
          el={el}
          selected={el.id === selectedId}
          editing={el.id === editingId}
          onMouseDown={onMouseDown}
          onResizeMouseDown={onResizeMouseDown}
          onTextChange={(val) => onUpdate(el.id, { content: val } as Partial<TextElement>)}
          onBlurEdit={() => setEditingId(null)}
        />
      ))}
    </div>
  )
}

interface ElementRendererProps {
  el: JournalElement
  selected: boolean
  editing: boolean
  onMouseDown: (e: React.MouseEvent, el: JournalElement) => void
  onResizeMouseDown: (e: React.MouseEvent, el: JournalElement) => void
  onTextChange: (val: string) => void
  onBlurEdit: () => void
}

function ElementRenderer({
  el,
  selected,
  editing,
  onMouseDown,
  onResizeMouseDown,
  onTextChange,
  onBlurEdit,
}: ElementRendererProps) {
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus()
    }
  }, [editing])

  const style: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    transform: `rotate(${el.rotation}deg)`,
    zIndex: el.zIndex,
    cursor: "grab",
    userSelect: "none",
  }

  const selectionRing = selected
    ? {
        outline: "2px dashed rgba(220,100,80,0.8)",
        outlineOffset: "2px",
      }
    : {}

  if (el.type === "text") {
    const textEl = el as TextElement
    return (
      <div
        style={{ ...style, ...selectionRing, minWidth: 80, minHeight: 24 }}
        onMouseDown={(e) => onMouseDown(e, el)}
      >
        {editing ? (
          <textarea
            ref={textRef}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{
              fontFamily: textEl.fontFamily,
              fontSize: textEl.fontSize,
              color: textEl.color,
              textAlign: textEl.align,
              fontWeight: textEl.bold ? "bold" : "normal",
              fontStyle: textEl.italic ? "italic" : "normal",
              lineHeight: 1.4,
            }}
            value={textEl.content}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onBlurEdit}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            style={{
              fontFamily: textEl.fontFamily,
              fontSize: textEl.fontSize,
              color: textEl.color,
              textAlign: textEl.align,
              fontWeight: textEl.bold ? "bold" : "normal",
              fontStyle: textEl.italic ? "italic" : "normal",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              width: "100%",
              height: "100%",
            }}
          >
            {textEl.content}
          </div>
        )}
        {selected && (
          <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, el)} />
        )}
      </div>
    )
  }

  if (el.type === "sticker") {
    const stickerEl = el as StickerElement
    return (
      <div
        style={{
          ...style,
          ...selectionRing,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: stickerEl.fontSize,
          lineHeight: 1,
        }}
        onMouseDown={(e) => onMouseDown(e, el)}
      >
        {stickerEl.emoji}
        {selected && (
          <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, el)} />
        )}
      </div>
    )
  }

  if (el.type === "image") {
    const imgEl = el as ImageElement
    return (
      <div
        style={{ ...style, ...selectionRing }}
        onMouseDown={(e) => onMouseDown(e, el)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgEl.src}
          alt="journal image"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          draggable={false}
        />
        {selected && (
          <ResizeHandle onMouseDown={(e) => onResizeMouseDown(e, el)} />
        )}
      </div>
    )
  }

  return null
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary/80 border-2 border-white cursor-se-resize"
      style={{ transform: "translate(50%,50%)", zIndex: 9999 }}
      onMouseDown={(e) => {
        e.stopPropagation()
        onMouseDown(e)
      }}
    />
  )
}
