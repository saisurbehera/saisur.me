import { FLOWER_COLORS, getGradientColor } from './colors'

export function generateLotus(cx, cy, scale) {
  const points = []
  const colors = FLOWER_COLORS.lotus
  
  // 1. The Glowing Heart (Airy, not dense)
  for (let i = 0; i < 200; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.pow(Math.random(), 1.5) * 20 * scale 
    
    points.push({
      x: cx + r * Math.cos(theta),
      y: cy + (Math.random() - 0.5) * 10 * scale,
      z: r * Math.sin(theta) * 0.5,
      color: getGradientColor(colors.center, Math.random()),
      size: (3 + Math.random() * 3) * scale,
      opacity: 0.8 + Math.random() * 0.2,
      charIndex: Math.floor(Math.random() * 23) // Various chars
    })
  }

  const createPetal = (angleOffset, distance, length, width, tiltAngle, curl, colorT) => {
    const petalPoints = 120 // Reduced from 300 for clarity
    for (let i = 0; i < petalPoints; i++) {
      const u = Math.random()
      const v = (Math.random() - 0.5) * 2
      
      // Sharper, more elegant profile
      const widthProfile = Math.sin(u * Math.PI) * Math.pow(u, 0.5)
      const currentWidth = width * widthProfile * scale * 0.8 // Slightly thinner
      
      const r = distance * scale + u * length * scale
      const h = (u * length * scale) * Math.sin(tiltAngle) + Math.pow(u, 2) * curl * scale
      const sideOffset = v * currentWidth * 0.5
      
      const cosA = Math.cos(angleOffset)
      const sinA = Math.sin(angleOffset)
      
      const pX = r * cosA - sideOffset * sinA
      const pZ = r * sinA + sideOffset * cosA 
      const pY = h 
      
      const tilt = 0.6 
      const rotY = pY * Math.cos(tilt) - pZ * Math.sin(tilt)
      const rotZ = pY * Math.sin(tilt) + pZ * Math.cos(tilt)
      
      const finalX = cx + pX
      const finalY = cy - rotY
      const finalZ = rotZ
      
      const col = getGradientColor(colors.petals, colorT + u * 0.3)
      
      // Flower Point
      points.push({
        x: finalX + (Math.random()-0.5)*2,
        y: finalY + (Math.random()-0.5)*2,
        z: finalZ,
        color: col,
        size: (4 + Math.random() * 4) * scale, // Larger characters
        opacity: (0.85 + Math.random() * 0.15), // Higher opacity for clarity
        charIndex: Math.floor(Math.random() * 200) // Much wider variety
      })

      // Reflection Point (Water) - Clearer
      if (Math.random() > 0.6) { // More reflection points
        const waterLevel = cy + 70 * scale
        const distFromWater = waterLevel - finalY
        
        // Mirror Y roughly
        const refY = waterLevel + distFromWater * 0.9 
        
        // Less noise for clearer reflection, just subtle wave
        const ripple = Math.sin(finalX * 0.05 + finalZ * 0.05) * 5 * scale
        
        points.push({
          x: finalX + ripple,
          y: refY,
          z: finalZ,
          color: col, 
          size: (3 + Math.random() * 4) * scale, 
          opacity: 0.1 * (1 - u) + 0.05, // Lower opacity for subtlety
          charIndex: 126 // Tilde ~
        })
      }
    }
  }

  const layers = [
    { count: 6, dist: 10, len: 50, width: 25, angle: 1.2, curl: 5, color: 0.1 },
    { count: 8, dist: 20, len: 70, width: 35, angle: 0.9, curl: 10, color: 0.3 },
    { count: 12, dist: 30, len: 90, width: 45, angle: 0.6, curl: 15, color: 0.5 },
    { count: 16, dist: 40, len: 110, width: 55, angle: 0.3, curl: 10, color: 0.7 }
  ]

  layers.forEach((layer, idx) => {
    const layerOffset = (idx % 2) * (Math.PI / layer.count)
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2 + layerOffset
      createPetal(angle, layer.dist, layer.len, layer.width, layer.angle, layer.curl, layer.color)
    }
  })

  // 3. The Pond Surface (Background plane)
  // Sparse field of ripples
  for (let i = 0; i < 600; i++) {
    const angle = Math.random() * Math.PI * 2
    // Large disk on the ground
    const r = Math.sqrt(Math.random()) * 250 * scale 
    
    // Perspective projection for floor
    // X is horizontal, Z is depth. 
    // We tilt the floor same as flower? Or just flat on screen?
    // Let's place it flat in 3D world (X-Z plane) and tilt it.
    
    const pX = r * Math.cos(angle)
    const pZ = r * Math.sin(angle)
    const pY = 0 // Flat plane relative to water level
    
    const tilt = 0.6 
    // Rotate around X axis
    const rotY = pY * Math.cos(tilt) - pZ * Math.sin(tilt)
    const rotZ = pY * Math.sin(tilt) + pZ * Math.cos(tilt)
    
    const waterLevel = cy + 60 * scale
    
    points.push({
      x: cx + pX,
      y: waterLevel - rotY, // Project to screen
      z: rotZ,
      color: [0.2, 0.4, 0.6], // Deep blueish
      size: (4 + Math.random() * 6) * scale,
      opacity: 0.1 + Math.random() * 0.1,
      charIndex: 126 // Tilde ~
    })
  }

  points.sort((a, b) => a.z - b.z)
  return points
}
