import { FLOWER_COLORS, getGradientColor } from './colors'

export function generateRose(cx, cy, scale) {
  const points = []
  const colors = FLOWER_COLORS.rose

  // Dense spiral center
  for (let i = 0; i < 250; i++) {
    const t = i / 250
    const theta = t * Math.PI * 10
    const r = (3 + t * 32) * scale
    const ox = (Math.random() - 0.5) * 4 * scale
    const oy = (Math.random() - 0.5) * 4 * scale
    points.push({
      x: cx + r * Math.cos(theta) + ox,
      y: cy + r * Math.sin(theta) + oy,
      color: getGradientColor(colors.petals, 0.1 + t * 0.4),
      size: (2 + t * 3) * scale,
      opacity: 0.75 + t * 0.2
    })
  }

  // Layered petals - much denser
  for (let layer = 0; layer < 7; layer++) {
    const k = 5
    const baseR = (35 + layer * 20) * scale
    for (let i = 0; i < 300; i++) {
      const theta = (i / 300) * Math.PI * 2
      const petalFactor = Math.pow(Math.max(0, Math.cos(k * theta)), 0.6)
      if (petalFactor > 0.1) {
        const r = baseR * (0.6 + 0.4 * petalFactor)
        const spread = (1 - petalFactor) * 8 * scale
        points.push({
          x: cx + r * Math.cos(theta) + (Math.random() - 0.5) * spread,
          y: cy + r * Math.sin(theta) + (Math.random() - 0.5) * spread,
          color: getGradientColor(colors.petals, layer / 7 + petalFactor * 0.2),
          size: (2 + Math.random() * 3) * scale,
          opacity: 0.55 + petalFactor * 0.4
        })
      }
    }
  }

  // Extra scatter for organic feel
  for (let i = 0; i < 400; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = (20 + Math.random() * 100) * scale
    const petalCheck = Math.cos(5 * angle)
    if (petalCheck > 0.2) {
      points.push({
        x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 10,
        y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 10,
        color: getGradientColor(colors.petals, Math.random()),
        size: (2 + Math.random() * 2) * scale,
        opacity: 0.4 + Math.random() * 0.4
      })
    }
  }

  return points
}
