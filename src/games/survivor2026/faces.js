/* ---------- Facce: foto se ci sono, segnaposto se mancano ---------- */
const TAU = Math.PI * 2
const SPR = 128
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'

function canvasOf(paint) {
  const c = document.createElement('canvas')
  c.width = c.height = SPR
  paint(c.getContext('2d'), SPR)
  return c
}

function ring(x, s, color) {
  x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 4, 0, TAU)
  x.lineWidth = 6; x.strokeStyle = color; x.stroke()
}

function placeholder(emoji, bg, color) {
  return canvasOf((x, s) => {
    x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 4, 0, TAU); x.fillStyle = bg; x.fill()
    ring(x, s, color)
    x.font = (s * 0.6) + 'px ' + EMOJI; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(emoji, s / 2, s / 2 + s * 0.05)
  })
}

// Quadrato sorgente: dal crop se c'è, altrimenti centrato
function sourceSquare(w, h, crop) {
  if (!crop) {
    const m = Math.min(w, h)
    return { sx: (w - m) / 2, sy: (h - m) / 2, m }
  }
  const m = Math.min(crop.size * w, w, h)
  const sx = Math.max(0, Math.min(w - m, crop.cx * w - m / 2))
  const sy = Math.max(0, Math.min(h - m, crop.cy * h - m / 2))
  return { sx, sy, m }
}

function photo(img, crop, bg, color) {
  return canvasOf((x, s) => {
    const { sx, sy, m } = sourceSquare(img.naturalWidth, img.naturalHeight, crop)
    x.save(); x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 4, 0, TAU); x.clip()
    x.fillStyle = bg; x.fillRect(0, 0, s, s) // sfondo per i PNG scontornati
    x.drawImage(img, sx, sy, m, m, 0, 0, s, s)
    x.restore(); ring(x, s, color)
  })
}

// spec: null | "url" | { src, crop }
export function face(spec, emoji, bg, color) {
  const slot = { img: placeholder(emoji, bg, color) }
  const src = typeof spec === 'string' ? spec : spec && spec.src
  if (!src) return slot
  const im = new Image()
  im.onload = () => {
    try { slot.img = photo(im, spec.crop, bg, color) } catch (e) { console.warn('Foto non disegnabile:', src, e) }
  }
  im.onerror = () => console.warn('Foto non trovata:', src)
  im.src = src
  return slot
}
