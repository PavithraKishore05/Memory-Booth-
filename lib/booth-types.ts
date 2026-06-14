export type FilterId =
  | "none"
  | "classic"
  | "noir"
  | "mono"
  | "silver"
  | "ink"
  | "sepia"
  | "vintage"
  | "fade"
  | "cool"
  | "warm"
  | "dreamy"

export type Filter = {
  id: FilterId
  label: string
  css: string
}

export const FILTERS: Filter[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "classic", label: "Classic", css: "contrast(1.1) saturate(1.15) brightness(1.03)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.35) contrast(1.05) saturate(1.2) brightness(1.02)" },
  { id: "fade", label: "Faded", css: "contrast(0.9) saturate(0.85) brightness(1.08)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.2) brightness(1.02)" },
  { id: "mono", label: "Mono", css: "grayscale(1) contrast(1.05) brightness(1.08)" },
  { id: "silver", label: "Silver", css: "grayscale(1) contrast(1.35) brightness(1.12) saturate(0.6)" },
  { id: "ink", label: "Ink", css: "grayscale(1) contrast(1.45) brightness(0.92)" },
  { id: "sepia", label: "Sepia", css: "sepia(0.7) contrast(1.05) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(-12deg) brightness(1.03)" },
  { id: "warm", label: "Warm", css: "sepia(0.2) saturate(1.3) hue-rotate(8deg) brightness(1.04)" },
  { id: "dreamy", label: "Dreamy", css: "contrast(0.95) saturate(1.25) brightness(1.1) blur(0.3px)" },
]

export type FrameId = "white" | "black" | "cream" | "pink" | "film"

export type Frame = {
  id: FrameId
  label: string
  bg: string
  text: string
}

export const FRAMES: Frame[] = [
  { id: "white", label: "Classic White", bg: "#ffffff", text: "#3a2a2a" },
  { id: "cream", label: "Cream", bg: "#f7efe2", text: "#5a4636" },
  { id: "pink", label: "Blush Pink", bg: "#fbe3ea", text: "#9b3a59" },
  { id: "black", label: "Midnight", bg: "#1c1c1e", text: "#f4f4f5" },
  { id: "film", label: "Film Strip", bg: "#161616", text: "#f4f4f5" },
]

// A placed sticker on the strip
export type PlacedSticker = {
  id: string
  emoji: string
  x: number // 0..1 relative to strip width
  y: number // 0..1 relative to strip height
  scale: number
  rotation: number
}

export const STICKER_SET = [
  "⭐",
  "✨",
  "💖",
  "🌸",
  "🎀",
  "🦋",
  "🌈",
  "☁️",
  "🍓",
  "🌷",
  "🌟",
  "💫",
  "🧸",
  "🍒",
  "🌙",
  "☀️",
  "🐰",
  "🐱",
  "💗",
  "🫶",
  "🔥",
  "😎",
  "👑",
  "🎈",
]

export type BoothState = {
  photos: string[] // captured photo data URLs (raw, unfiltered)
  filter: FilterId
  frame: FrameId
  stickers: PlacedSticker[]
  caption: string
  date: string
}
