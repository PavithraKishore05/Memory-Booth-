import {
  FILTERS,
  FRAMES,
  type BoothState,
} from "@/lib/booth-types"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Renders the final photo strip to a high-resolution canvas and returns a PNG data URL.
 */
export async function renderStrip(
  state: BoothState,
  options: { scale?: number } = {},
): Promise<string> {
  const scale = options.scale ?? 3 // export multiplier for crisp output
  const PAD = 14
  const GAP = 10
  const PHOTO = 252 // base square photo size
  const stripW = PHOTO + PAD * 2
  const footerH = 56
  const stripH =
    PAD + state.photos.length * (PHOTO + GAP) - GAP + footerH + PAD

  const canvas = document.createElement("canvas")
  canvas.width = stripW * scale
  canvas.height = stripH * scale
  const ctx = canvas.getContext("2d")!
  ctx.scale(scale, scale)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  const frame = FRAMES.find((f) => f.id === state.frame) ?? FRAMES[0]
  const isFilm = state.frame === "film"
  const filterCss = FILTERS.find((f) => f.id === state.filter)?.css ?? "none"

  // background
  ctx.fillStyle = frame.bg
  ctx.fillRect(0, 0, stripW, stripH)

  // photos
  const images = await Promise.all(
    state.photos.map((p) => (p ? loadImage(p) : Promise.resolve(null))),
  )
  images.forEach((img, i) => {
    const y = PAD + i * (PHOTO + GAP)
    const x = PAD
    ctx.save()
    // @ts-expect-error filter is supported in modern browsers
    ctx.filter = filterCss === "none" ? "none" : filterCss
    const innerX = isFilm ? x + 10 : x
    const innerW = isFilm ? PHOTO - 20 : PHOTO
    if (img) {
      // cover-crop into square
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, innerX, y, innerW, PHOTO)
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.12)"
      ctx.fillRect(innerX, y, innerW, PHOTO)
      ctx.strokeStyle = "rgba(255,255,255,0.22)"
      ctx.lineWidth = 2
      ctx.strokeRect(innerX + 1, y + 1, innerW - 2, PHOTO - 2)
    }
    ctx.restore()

    if (isFilm) {
      ctx.fillStyle = "rgba(255,255,255,0.85)"
      for (let h = 0; h < 6; h++) {
        const hy = y + 12 + h * ((PHOTO - 24) / 5) - 3
        ctx.fillRect(x + 2, hy, 5, 6)
        ctx.fillRect(x + PHOTO - 7, hy, 5, 6)
      }
    }
  })

  // footer caption + date
  const footerY = PAD + state.photos.length * (PHOTO + GAP) - GAP
  ctx.fillStyle = frame.text
  ctx.textAlign = "center"
  ctx.font = "italic 22px 'Caveat', cursive"
  ctx.fillText(state.caption || "Polaroid Booth", stripW / 2, footerY + 26)
  ctx.font = "9px 'Geist', sans-serif"
  ctx.globalAlpha = 0.7
  ctx.fillText(
    (state.date || "").toUpperCase(),
    stripW / 2,
    footerY + 44,
  )
  ctx.globalAlpha = 1

  // stickers (emoji)
  for (const sticker of state.stickers) {
    const px = sticker.x * stripW
    const py = sticker.y * stripH
    const fontSize = sticker.scale * 40
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate((sticker.rotation * Math.PI) / 180)
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(sticker.emoji, 0, 0)
    ctx.restore()
  }

  return canvas.toDataURL("image/png")
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
