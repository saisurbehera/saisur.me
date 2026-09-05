const TAU = Math.PI * 2
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

// All species use actual curved surfaces. The renderer samples their color/depth
// onto the same fixed ASCII grid, so topology and shading survive character swaps.
export function buildFlowerGeometry(type = 'lotus') {
  const surface = [], points = [], water = []

  function mesh(sample, { rows = 24, cols = 18, layer = 0, phase = 0, kind = 0, color } = {}) {
    function vertex(u, v) {
      const p = sample(u, v)
      const a0 = sample(clamp(u - 0.001, 0.00001, 0.99999), v)
      const a1 = sample(clamp(u + 0.001, 0.00001, 0.99999), v)
      const b0 = sample(u, clamp(v - 0.001, 0.00001, 0.99999))
      const b1 = sample(u, clamp(v + 0.001, 0.00001, 0.99999))
      const a = a1.map((x, i) => x - a0[i]), b = b1.map((x, i) => x - b0[i])
      const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
      const length = Math.hypot(...n) || 1
      const edge = (v * 2 - 1) ** 2
      const blush = Math.min(1, u * 0.82 + edge * 0.3)
      const pigment = color ? color(u, v) : [0.80 + layer * 0.075 + Math.cos(phase - 0.8) * 0.055, 0.96 - blush * 0.56, edge]
      return [...p, ...n.map(x => x / length), ...pigment, 0, kind === 0 ? u * u : 0, phase, kind]
    }
    const grid = []
    for (let row = 0; row <= rows; row++) {
      grid[row] = []
      for (let col = 0; col <= cols; col++) grid[row][col] = vertex(clamp(row / rows, 0.0001, 0.999), clamp(col / cols, 0.0001, 0.9999))
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) surface.push(...grid[row][col], ...grid[row + 1][col], ...grid[row][col + 1], ...grid[row][col + 1], ...grid[row + 1][col], ...grid[row + 1][col + 1])
    }
  }

  function stem(height, bend = 0) {
    mesh((u, v) => [Math.sin(u * 2) * bend + Math.cos(v * TAU) * 0.025, u * height, Math.sin(v * TAU) * 0.025],
      { rows: 24, cols: 8, kind: 2, color: () => [1, 0, 0] })
  }

  // The camera looks down by 0.40 radians and yaws by 0.30. Aim the
  // blossom's outward depth toward it; local y stays upright on screen.
  // Keep this in the geometry so wind, lighting and reflections remain 3D.
  const frontTilt = Math.PI / 2 - 0.40
  function face(x, y, depth, height, tilt = frontTilt) {
    const z = -y * Math.cos(tilt) + depth * Math.sin(tilt)
    return [x * Math.cos(0.30) + z * Math.sin(0.30),
      height + y * Math.sin(tilt) + depth * Math.cos(tilt),
      -x * Math.sin(0.30) + z * Math.cos(0.30)]
  }

  function seedHead(radius, height, tilt, dark = false) {
    mesh((u, v) => {
      const r = radius * u, angle = v * TAU
      return face(r * Math.cos(angle), r * Math.sin(angle), 0.07 + 0.12 * (1 - u * u), height, tilt)
    }, { rows: 12, cols: 64, kind: 1, color: u => [dark ? 0.40 + u * 0.44 : 1, 0, 0] })
    for (let i = 0; i < 340; i++) {
      const angle = i * 2.39996, r = Math.sqrt(i / 340) * radius * 0.95
      const p = face(r * Math.cos(angle), r * Math.sin(angle), 0.09 + 0.12 * (1 - (r / radius) ** 2), height, tilt)
      points.push(...p, 0, 1, 1, dark ? 0.5 + (i % 7) * 0.075 : 0.85 + (i % 3) * 0.075, 0, 0, 0, 0, 0, 1)
    }
  }

  function lotusPetals(layers, irisFalls = false) {
    layers.forEach((layer, level) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = i / layer.count * TAU + level * 0.35
        mesh((u, v) => {
          const side = (v * 2 - 1) * layer.width * Math.sin(Math.PI * u) ** 0.85
          const r = layer.base + layer.length * u * Math.cos(layer.lift)
          const y = irisFalls && level === 0 ? 0.98 + Math.sin(u * Math.PI) * 0.5 - u * u * 0.52
            : 0.62 + layer.length * u * Math.sin(layer.lift) + layer.curl * u ** 3 + (v * 2 - 1) ** 2 * Math.sin(Math.PI * u) ** 0.85 * 0.19
          return [r * Math.cos(angle) - side * Math.sin(angle), y, r * Math.sin(angle) + side * Math.cos(angle)]
        }, { rows: 28, layer: level, phase: angle })
        if (irisFalls && level === 0) {
          mesh((u, v) => {
            const t = 0.35 + u * 0.45, r = layer.base + layer.length * t
            const side = (v * 2 - 1) * 0.045 * Math.sin(Math.PI * u)
            return [r * Math.cos(angle) - side * Math.sin(angle), 1 + Math.sin(t * Math.PI) * 0.5 - t * t * 0.52, r * Math.sin(angle) + side * Math.cos(angle)]
          }, { rows: 12, cols: 4, kind: 1, color: () => [1, 0, 0] })
        }
      }
    })
  }

  if (type === 'lotus') {
    lotusPetals([
      { count: 10, length: 1.65, width: 0.53, lift: 0.10, curl: 0.22, base: 0.20 },
      { count: 8, length: 1.32, width: 0.47, lift: 0.46, curl: 0.26, base: 0.13 },
      { count: 6, length: 1.04, width: 0.37, lift: 0.91, curl: 0.16, base: 0.07 },
    ])
    for (let i = 0; i < 190; i++) {
      const angle = i * 2.39996, r = Math.sqrt(i / 190) * 0.24
      points.push(Math.cos(angle) * r, 0.72 + 0.06 * (1 - r / 0.24), Math.sin(angle) * r, 0, 1, 0, 1, 0.82, 0.35, 7 + i % 4, 0, angle, 1)
    }
    stem(0.64)
  } else if (type === 'rose') {
    // Broad rolled lips overlap in a spiral, tightening into the central bud.
    for (let level = 0; level < 6; level++) {
      const count = Math.max(3, 8 - level), size = 1.47 - level * 0.20
      for (let i = 0; i < count; i++) {
        const angle = i / count * TAU + level * 0.57
        mesh((u, v) => {
          const side = v * 2 - 1
          const a = angle + side * (0.38 + 0.38 * Math.sin(u * Math.PI * 0.75)) + (1 - u) * 0.30
          const r = 0.055 + size * Math.sin(u * Math.PI / 2) * Math.cos(0.22 + level * 0.15) + 0.08 * u ** 5
          const y = 0.67 + level * 0.105 + u * (0.42 + level * 0.045) - side * side * 0.20 * u ** 3 - 0.11 * u ** 7
          return face(r * Math.cos(a), -r * Math.sin(a), y - 0.67, 1.46)
        }, { layer: level * 0.4, phase: angle, rows: 24, cols: 22 })
      }
    }
    stem(1.46)
  } else if (type === 'tulip') {
    for (let i = 0; i < 6; i++) {
      const angle = i / 6 * TAU
      mesh((u, v) => {
        const side = v * 2 - 1, a = angle + side * 0.68 * Math.sin(u * Math.PI * 0.76)
        const r = 0.16 + 0.70 * Math.sin(u * Math.PI * 0.60)
        return [r * Math.cos(a), 0.72 + u * 1.43 - side * side * 0.22 * u ** 4, r * Math.sin(a)]
      }, { layer: i % 2, phase: angle, rows: 30, cols: 22 })
    }
    stem(0.82)
  } else if (type === 'iris') {
    lotusPetals([
      { count: 3, length: 1.62, width: 0.52, lift: 0, curl: 0, base: 0.14 },
      { count: 3, length: 1.48, width: 0.45, lift: 1.22, curl: 0.05, base: 0.10 },
    ], true)
    stem(0.9)
  } else if (type === 'bluebell') {
    stem(2.42, 0.10)
    for (let i = 0; i < 6; i++) {
      const height = 0.77 + i * 0.27, sign = i % 2 ? 1 : -1, lean = sign * 0.70
      const rootX = Math.sin(height / 2.42 * 2) * 0.10, originX = rootX + sign * (0.36 - i * 0.025)
      const length = 0.54 - i * 0.033
      mesh((u, v) => {
        const angle = v * TAU, r = 0.07 + 0.19 * u * u + 0.05 * u ** 7
        const x = Math.cos(angle) * r
        const y = -u * length + Math.cos(angle * 5) * 0.045 * u ** 7
        return [originX + x * Math.cos(lean) - y * Math.sin(lean), height + x * Math.sin(lean) + y * Math.cos(lean), Math.sin(angle) * r]
      }, { rows: 24, cols: 40, phase: i * 1.7 })
      mesh((u, v) => [rootX + (originX - rootX) * u + Math.cos(v * TAU) * 0.013, height + Math.sin(Math.PI * u) * 0.10, Math.sin(v * TAU) * 0.013],
        { rows: 12, cols: 6, kind: 2, color: () => [1, 0, 0] })
    }
  } else {
    const configs = {
      sunflower: { layers: 2, count: 20, length: 0.92, width: 0.15, base: 0.40, height: 1.46, tilt: frontTilt, center: 0.45 },
      daisy: { layers: 1, count: 22, length: 1.02, width: 0.115, base: 0.22, height: 1.39, tilt: frontTilt, center: 0.27 },
      poppy: { layers: 1, count: 5, length: 1.19, width: 0.70, base: 0.14, height: 1.36, tilt: frontTilt, center: 0.23, rounded: true },
      cosmos: { layers: 1, count: 8, length: 1.14, width: 0.44, base: 0.15, height: 1.37, tilt: frontTilt, center: 0.23, rounded: true },
      dahlia: { layers: 6, count: 16, length: 1.08, width: 0.21, base: 0.35, height: 1.40, tilt: frontTilt, center: 0.10 },
    }
    const config = configs[type] || configs.daisy
    for (let level = 0; level < config.layers; level++) {
      const shrink = type === 'dahlia' ? 1 - level * 0.145 : 1 - level * 0.06
      const count = config.count - (type === 'dahlia' ? level * 2 : level)
      for (let i = 0; i < count; i++) {
        const angle = i / count * TAU + level * 0.24
        mesh((u, v) => {
          const side = v * 2 - 1
          const profile = Math.sin(Math.PI * u * (config.rounded ? 0.82 : 1)) ** (config.rounded ? 0.62 : 0.80)
          const across = side * config.width * shrink * profile
          let r = (config.base + config.length * u) * shrink
          if (config.rounded) r -= side * side * 0.20 * u ** 5
          if (type === 'cosmos') r -= (0.5 + 0.5 * Math.cos(side * Math.PI * 3)) * 0.075 * u ** 8
          const cup = (type === 'poppy' ? 0.15 : 0.07) * Math.sin(Math.PI * u) + side * side * profile * 0.12
          const wave = type === 'poppy' ? Math.sin(side * 9 + u * 5) * u * 0.05 : 0
          const depth = cup + wave - 0.12 * u ** 3 + level * (type === 'dahlia' ? 0.075 : 0.035)
          return face(r * Math.cos(angle) - across * Math.sin(angle), r * Math.sin(angle) + across * Math.cos(angle), depth, config.height, config.tilt)
        }, { phase: angle, layer: level * 0.4, rows: 24, cols: config.rounded ? 24 : 12 })
      }
    }
    seedHead(config.center, config.height, config.tilt, type === 'sunflower' || type === 'poppy')
    stem(config.height)
  }
  // A contained patch of water: broken horizontal strokes, softer toward its
  // edges and foreground, plus three small ripples where the stem meets it.
  const noise = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return value - Math.floor(value)
  }
  for (let row = 0; row < 26; row++) {
    const z = -0.7 + row * 0.12
    const halfWidth = 2.55 - Math.abs(z - 0.3) * 0.34
    for (let col = 0; col < 80; col++) {
      const x = (col / 79 * 2 - 1) * halfWidth
      const patch = Math.sin(x * 7 + row * 1.2) * 0.5 + 0.5
      if (noise(col, row) > 0.16 + patch * 0.30) continue
      const fade = Math.pow(1 - Math.abs(x) / halfWidth, 0.65) * Math.pow(1 - row / 29, 0.9)
      water.push(x, -0.018, z + Math.sin(x * 3 + row) * 0.015, 0, 1, 0, fade, 0, 0, 15, 0, x * 2 + z * 3, 3)
    }
  }
  for (let ring = 0; ring < 3; ring++) {
    const radius = 0.30 + ring * 0.32
    for (let i = 0; i < 100; i++) {
      if (noise(i, ring + 90) < 0.30) continue
      const angle = i / 100 * TAU
      water.push(Math.cos(angle) * radius, -0.012, Math.sin(angle) * radius * 0.55, 0, 1, 0, 1 - ring * 0.17, 0, 0, 14, 0, angle + ring, 3)
    }
  }
  return { surface: new Float32Array(surface), points: new Float32Array(points), water: new Float32Array(water) }
}
