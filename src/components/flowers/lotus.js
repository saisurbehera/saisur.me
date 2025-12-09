import { FLOWER_COLORS, getGradientColor } from './colors'

export function generateLotus(cx, cy, scale, width, height) {
  const points = []
  const colors = FLOWER_COLORS.lotus

  // Consistent sizing based on available space
  const flowerScale = Math.min(scale, 2.0) * 1.5 // Bigger flower

  // Position flower on the right side of screen
  const flowerCx = width * 0.65
  const flowerCy = cy + 30 * flowerScale

  // 1. Glowing center - bright yellow/white
  for (let i = 0; i < 300; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.pow(Math.random(), 2) * 12 * flowerScale

    points.push({
      x: flowerCx + r * Math.cos(theta),
      y: flowerCy + (Math.random() - 0.5) * 6 * flowerScale,
      z: r * Math.sin(theta) * 0.3,
      color: getGradientColor(colors.center, Math.random()),
      size: (1.5 + Math.random() * 1.5) * flowerScale,
      opacity: 0.95,
      charIndex: Math.floor(Math.random() * 200)
    })
  }

  // Petal with visible shape
  const createPetal = (angleOffset, distance, length, width, tiltAngle, curl, colorT) => {
    const petalPoints = 400
    for (let i = 0; i < petalPoints; i++) {
      const u = Math.random()
      const v = (Math.random() - 0.5) * 2

      // Petal profile - pointed tips
      const widthProfile = Math.sin(u * Math.PI) * Math.pow(1 - u, 0.3)
      const currentWidth = width * widthProfile * flowerScale * 0.6

      const r = distance * flowerScale + u * length * flowerScale
      const h = (u * length * flowerScale) * Math.sin(tiltAngle) + Math.pow(u, 1.5) * curl * flowerScale
      const sideOffset = v * currentWidth * 0.5

      const cosA = Math.cos(angleOffset)
      const sinA = Math.sin(angleOffset)

      const pX = r * cosA - sideOffset * sinA
      const pZ = r * sinA + sideOffset * cosA
      const pY = h

      const tilt = 0.55
      const rotY = pY * Math.cos(tilt) - pZ * Math.sin(tilt)
      const rotZ = pY * Math.sin(tilt) + pZ * Math.cos(tilt)

      const finalX = flowerCx + pX
      const finalY = flowerCy - rotY
      const finalZ = rotZ

      const col = getGradientColor(colors.petals, colorT + u * 0.4)

      points.push({
        x: finalX + (Math.random()-0.5)*0.8,
        y: finalY + (Math.random()-0.5)*0.8,
        z: finalZ,
        color: col,
        size: (1.8 + Math.random() * 1.8) * flowerScale,
        opacity: 0.9,
        charIndex: Math.floor(Math.random() * 200)
      })

    }
  }

  // Lotus layers
  const layers = [
    { count: 5, dist: 5, len: 35, width: 12, angle: 1.4, curl: 5, color: 0.0 },
    { count: 8, dist: 10, len: 48, width: 18, angle: 1.1, curl: 10, color: 0.2 },
    { count: 11, dist: 16, len: 60, width: 24, angle: 0.75, curl: 13, color: 0.4 },
    { count: 14, dist: 22, len: 72, width: 30, angle: 0.45, curl: 12, color: 0.6 },
    { count: 16, dist: 28, len: 82, width: 35, angle: 0.25, curl: 8, color: 0.8 }
  ]

  layers.forEach((layer, idx) => {
    const layerOffset = (idx % 2) * (Math.PI / layer.count)
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2 + layerOffset
      createPetal(angle, layer.dist, layer.len, layer.width, layer.angle, layer.curl, layer.color)
    }
  })

  // Water line - touching the base of the flower
  const waterY = flowerCy + 25 * flowerScale

  // Green stalk coming down from flower center
  for (let i = 0; i < 200; i++) {
    const stalkHeight = Math.random() * 40 * flowerScale
    const stalkWidth = (Math.random() - 0.5) * 8 * flowerScale

    points.push({
      x: flowerCx + stalkWidth,
      y: flowerCy + stalkHeight,
      z: -50,
      color: [0.15, 0.4, 0.2],
      size: (1.5 + Math.random() * 1.5) * flowerScale,
      opacity: 0.8,
      charIndex: Math.floor(Math.random() * 200)
    })
  }

  // Pond surface - cover entire screen width
  for (let i = 0; i < 8000; i++) {
    // Full screen coverage from 0 to width
    const pX = Math.random() * width

    // Vertical spread below water line
    const yOffset = Math.random() * 120 * flowerScale

    points.push({
      x: pX,
      y: waterY + yOffset,
      z: -300 - Math.random() * 50,
      color: [0.05, 0.15, 0.25],
      size: (2.5 + Math.random() * 3) * flowerScale,
      opacity: 0.55,
      charIndex: 126
    })
  }

  // Reflection - mirrored pink flower below water line
  for (let i = 0; i < 1500; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * 80 * flowerScale

    const col = getGradientColor(colors.petals, Math.random())

    // Reflection starts at water line and goes down
    const reflectionDepth = Math.random() * 60 * flowerScale
    const ripple = Math.sin(angle * 3 + r * 0.1) * 3 * flowerScale

    points.push({
      x: flowerCx + r * Math.cos(angle) + ripple,
      y: waterY + 10 * flowerScale + reflectionDepth,
      z: -250 - Math.random() * 30,
      color: [col[0] * 0.5, col[1] * 0.3, col[2] * 0.4],
      size: (1.5 + Math.random() * 2) * flowerScale,
      opacity: 0.4 - reflectionDepth / (150 * flowerScale),
      charIndex: Math.floor(Math.random() * 200)
    })
  }

  points.sort((a, b) => a.z - b.z)
  return points
}
