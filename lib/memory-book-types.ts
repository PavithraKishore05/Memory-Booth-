export type JournalTemplateId = "brown" | "white"

export type JournalTemplate = {
  id: JournalTemplateId
  label: string
  src: string
  defaultTextColor: string
}

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: "brown",
    label: "Brown Journal",
    src: "/journal-brown.jpeg",
    defaultTextColor: "#2c1a0e",
  },
  {
    id: "white",
    label: "White Journal",
    src: "/journal-white.jpeg",
    defaultTextColor: "#3a2e28",
  },
]

export type ElementKind = "text" | "sticker" | "image"

export interface BaseEl {
  id: string
  kind: ElementKind
  x: number
  y: number
  w: number
  h: number
  rotation: number
  z: number
}

export interface TextEl extends BaseEl {
  kind: "text"
  content: string
  fontFamily: string
  fontSize: number
  color: string
  align: "left" | "center" | "right"
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface StickerEl extends BaseEl {
  kind: "sticker"
  emoji: string
  fontSize: number
}

export interface ImageEl extends BaseEl {
  kind: "image"
  src: string
}

export type JournalEl = TextEl | StickerEl | ImageEl

export const FONT_OPTIONS = [
  { value: "Dancing Script, cursive", label: "Dancing Script" },
  { value: "var(--font-handwriting), cursive", label: "Handwriting" },
  { value: "var(--font-heading), serif", label: "Playfair" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Typewriter" },
]

export const EMOJI_LIST = [
  "🥰","😍","✨","😎","💗","🌸","🌼","🎀","🦋","🌈",
  "⭐","💫","🧸","🍒","🌙","☀️","🐰","🐱","💝","🫶",
  "🔥","👑","🎈","💌","🎵","📷","🌿","🪴","🎨",
]

export const STICKER_LIST = [
  { emoji: "🩷", label: "Heart" },
  { emoji: "⭐", label: "Star" },
  { emoji: "🎀", label: "Bow" },
  { emoji: "🌼", label: "Daisy" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "✉️", label: "Envelope" },
  { emoji: "✨", label: "Sparkle" },
 
  { emoji: "🌸", label: "Blossom" },
  { emoji: "🍄", label: "Mushroom" },
  { emoji: "🌿", label: "Leaf" },
  { emoji: "🧸", label: "Bear" },
  { emoji: "🍓", label: "Berry" },
  { emoji: "🌙", label: "Moon" },
  { emoji: "🎵", label: "Music" },
]
