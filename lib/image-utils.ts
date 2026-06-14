export function toSquareDataUrl(
  source: HTMLImageElement | HTMLVideoElement,
  w: number,
  h: number,
  mirror: boolean,
): string | null {
  if (!w || !h) return null
  const size = Math.min(w, h)
  const sx = (w - size) / 2
  const sy = (h - size) / 2
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.imageSmoothingQuality = "high"
  if (mirror) {
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(source, sx, sy, size, size, 0, 0, size, size)
  return canvas.toDataURL("image/jpeg", 0.95)
}

export function fileToSquareDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const out = toSquareDataUrl(
        img,
        img.naturalWidth,
        img.naturalHeight,
        false,
      )
      URL.revokeObjectURL(url)
      resolve(out)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}