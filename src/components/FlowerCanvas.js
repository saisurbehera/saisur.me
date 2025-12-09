import { useEffect, useRef, useState } from 'react'
import { GENERATORS } from './flowers/index'

// Vertex shader - handles position and passes data to fragment shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute vec3 a_color;
  attribute float a_opacity;
  attribute float a_phase;
  attribute float a_charIndex;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_center;
  uniform float u_windStrength;

  varying vec3 v_color;
  varying float v_opacity;
  varying float v_charIndex;

  void main() {
    // Swaying animation rooted at the bottom
    // We assume the flower is roughly centered at u_center
    // and "grows" upwards (negative Y in screen coords or positive Y in world, but screen Y increases down)
    
    vec2 relPos = a_position - u_center;
    
    // Wind effect
    float windSpeed = 1.0 + u_windStrength * 5.0; // Faster with strength
    float strength = u_windStrength;
    
    // Distance from "stalk base"
    // Use abs() so reflections (positive y) also sway
    float dist = abs(relPos.y);
    float heightFactor = dist / 200.0;
    
    // Sway angle
    float swayAngle = sin(u_time * windSpeed + a_phase * 0.5 + dist * 0.005) * strength * max(0.0, heightFactor);
    
    // Apply rotation
    float c = cos(swayAngle);
    float s = sin(swayAngle);
    
    // Rotate relative position
    vec2 rotatedPos = vec2(
      relPos.x * c - relPos.y * s,
      relPos.x * s + relPos.y * c
    );
    
    vec2 pos = u_center + rotatedPos;

    // Convert to clip space
    vec2 clipSpace = ((pos / u_resolution) * 2.0 - 1.0) * vec2(1, -1);

    gl_Position = vec4(clipSpace, 0, 1);
    
    // Enhance detail by making points smaller but varied
    gl_PointSize = a_size * 0.9; // Sharper characters

    v_color = a_color;
    v_opacity = a_opacity * (0.9 + sin(u_time * 1.5 + a_phase) * 0.1); // Shimmer
    v_charIndex = a_charIndex;
  }
`

// Helper to create a texture atlas from a string of characters
function createFontAtlas(gl) {
  const canvas = document.createElement('canvas')
  const size = 512
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  // Clear
  ctx.fillStyle = '#00000000'
  ctx.fillRect(0, 0, size, size)
  
  // Font settings
  const cols = 16
  const rows = 16
  const cellW = size / cols
  const cellH = size / rows
  const fontSize = Math.floor(cellH * 0.8)
  
  ctx.font = `bold ${fontSize}px monospace`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Characters to include:
  // 0-255 range covers ASCII and Extended ASCII
  // We'll map charIndex to UV coordinates
  
  // Custom set of "cool" characters for the flower
  // Including standard ASCII, some math symbols, box drawing, etc.
  // We need 256 slots max for this simple grid implementation.
  
  const chars = []
  // Use a curated list of aesthetic characters (thin, complex, elegant)
  // Avoiding solid blocks or simple circles
  const aestheticChars = '∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋⊌⊍⊎⊏⊐⊑⊒⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞⊟⊠⊡⊢⊣⊤⊥⊦⊧⊨⊩⊪⊫⊬⊭⊮⊯⊰⊱⊲⊳⊴⊵⊶⊷⊸⊹⊺⊻⊼⊽⊾⊿⋀⋁⋂⋃⋄⋅⋆⋇⋈⋉⋊⋋⋌⋍⋎⋏⋐⋑⋒⋓⋔⋕⋖⋗⋘⋙⋚⋛⋜⋝⋞⋟⋠⋡⋢⋣⋤⋥⋦⋧⋨⋩⋪⋫⋬⋭⋮⋯⋰⋱abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  
  for (let i = 0; i < 256; i++) {
    // Fill with aesthetic chars, repeating if necessary
    const char = aestheticChars[i % aestheticChars.length]
    chars.push(char)
  }
  
  // Overwrite specific indices if needed for logic (like tilde at 126)
  chars[126] = '~'
  
  // Fill the grid
  for (let i = 0; i < 256; i++) {
    const char = chars[i] || ''
    const col = i % cols
    const row = Math.floor(i / cols)
    
    const x = col * cellW + cellW / 2
    const y = row * cellH + cellH / 2 + cellH * 0.05 // Visual adjust
    
    ctx.fillText(char, x, y)
  }
  
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // Sharp
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  
  return texture
}

// Fragment shader - renders each point as a texture quad
const fragmentShaderSource = `
  precision mediump float;

  varying vec3 v_color;
  varying float v_opacity;
  varying float v_charIndex;

  uniform sampler2D u_fontTexture;

  void main() {
    // Point sprite coordinate (0 to 1)
    vec2 uv = gl_PointCoord;
    
    // Invert Y because font texture usually draws upright but WebGL UV might be flip
    // Usually gl_PointCoord (0,0) is top-left in some contexts or bottom-left.
    // Standard GL: (0,0) is bottom-left? No, for PointCoord (0,0) is top-left usually.
    // Let's assume standard behavior.
    
    // Map charIndex to Grid UV
    float index = mod(v_charIndex, 256.0);
    float cols = 16.0;
    float rows = 16.0;
    
    float col = mod(index, cols);
    float row = floor(index / cols);
    
    // Calculate UV in the atlas
    // Row 0 is top
    float u = (col + uv.x) / cols;
    float v = (row + uv.y) / rows;
    
    // Sample texture alpha
    vec4 texColor = texture2D(u_fontTexture, vec2(u, v));
    
    // Use texture alpha as mask
    float alpha = texColor.a;
    
    // Hard edge for crispness if desired, or smooth
    // alpha = smoothstep(0.4, 0.6, alpha);

    if (alpha < 0.1) discard;

    gl_FragColor = vec4(v_color, alpha * v_opacity);
  }
`

// Color palettes
const FLOWER_COLORS = {
  rose: {
    petals: [[1.0, 0.09, 0.27], [1.0, 0.27, 0.41], [1.0, 0.42, 0.54], [1.0, 0.56, 0.64], [1.0, 0.70, 0.76]],
    center: [[0.55, 0.0, 0.0], [0.65, 0.16, 0.16]],
  },
  sunflower: {
    petals: [[1.0, 0.76, 0.03], [1.0, 0.79, 0.16], [1.0, 0.84, 0.31], [1.0, 0.88, 0.51]],
    center: [[0.31, 0.20, 0.18], [0.36, 0.25, 0.22], [0.43, 0.30, 0.25]],
  },
  lotus: {
    petals: [[0.97, 0.73, 0.85], [0.96, 0.56, 0.69], [0.94, 0.38, 0.57], [0.93, 0.25, 0.48]],
    center: [[1.0, 0.92, 0.23], [1.0, 0.95, 0.46]],
  },
  dahlia: {
    petals: [[0.61, 0.15, 0.69], [0.67, 0.28, 0.74], [0.73, 0.41, 0.78], [0.81, 0.58, 0.85], [0.88, 0.75, 0.91]],
    center: [[1.0, 0.44, 0.0], [1.0, 0.56, 0.0]],
  },
  orchid: {
    petals: [[0.48, 0.12, 0.64], [0.56, 0.14, 0.67], [0.61, 0.15, 0.69], [0.67, 0.28, 0.74]],
    accent: [[0.91, 0.12, 0.39], [0.94, 0.38, 0.57]],
    center: [[1.0, 0.92, 0.23]],
  },
  cherry: {
    petals: [[1.0, 0.80, 0.82], [0.97, 0.73, 0.85], [0.99, 0.89, 0.93], [1.0, 0.94, 0.96]],
    center: [[1.0, 0.92, 0.23], [0.91, 0.12, 0.39]],
  },
  iris: {
    petals: [[0.25, 0.32, 0.71], [0.36, 0.42, 0.75], [0.47, 0.53, 0.80], [0.62, 0.66, 0.86]],
    falls: [[0.10, 0.14, 0.49], [0.16, 0.22, 0.58], [0.19, 0.25, 0.62]],
    beard: [[1.0, 0.92, 0.23], [1.0, 0.76, 0.03]],
  },
  peony: {
    petals: [[0.96, 0.56, 0.69], [0.94, 0.38, 0.57], [0.93, 0.25, 0.48], [0.91, 0.12, 0.39], [0.85, 0.11, 0.37]],
    center: [[1.0, 0.92, 0.23]],
  },
  tulip: {
    petals: [[0.90, 0.22, 0.21], [0.94, 0.33, 0.31], [0.96, 0.26, 0.21], [0.90, 0.45, 0.45]],
    center: [[0.18, 0.49, 0.20], [0.22, 0.56, 0.24]],
  },
  lavender: {
    petals: [[0.49, 0.30, 1.0], [0.70, 0.53, 1.0], [0.59, 0.46, 0.80], [0.40, 0.23, 0.71]],
    stem: [[0.18, 0.49, 0.20], [0.26, 0.63, 0.28]],
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ]
}

function getGradientColor(colors, t) {
  const clampedT = Math.max(0, Math.min(1, t))
  const idx = clampedT * (colors.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.min(lower + 1, colors.length - 1)
  return lerpColor(colors[lower], colors[upper], idx - lower)
}


// Removed inline generators in favor of imported ones


const EXPERIENCE_FLOWERS = {
  default: 'lotus',
  lapis: 'iris',
  walmart: 'sunflower',
  columbia: 'rose',
  inquirer: 'dahlia',
  amfam: 'cherry',
  mindgram: 'orchid',
  umich: 'peony',
  stellenbosch: 'lavender',
  aaa: 'tulip',
}

export function FlowerCanvas({ experienceId = 'default' }) {
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const programRef = useRef(null)
  const buffersRef = useRef({})
  const animationRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 600 })
  const [webglSupported, setWebglSupported] = useState(true)
  const windStrength = 0.08 // Constant default wind

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const flowerType = 'lotus'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let gl = glRef.current
    if (!gl) {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true })
      if (!gl) {
        console.error('WebGL not supported')
        setWebglSupported(false)
        return
      }
      glRef.current = gl

      // Create shaders and program
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
      if (!vertexShader || !fragmentShader) return

      const program = createProgram(gl, vertexShader, fragmentShader)
      if (!program) return
      programRef.current = program

      // Get attribute locations
      buffersRef.current.positionLoc = gl.getAttribLocation(program, 'a_position')
      buffersRef.current.sizeLoc = gl.getAttribLocation(program, 'a_size')
      buffersRef.current.colorLoc = gl.getAttribLocation(program, 'a_color')
      buffersRef.current.opacityLoc = gl.getAttribLocation(program, 'a_opacity')
      buffersRef.current.phaseLoc = gl.getAttribLocation(program, 'a_phase')
      buffersRef.current.charIndexLoc = gl.getAttribLocation(program, 'a_charIndex')

      // Get uniform locations
      buffersRef.current.resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
      buffersRef.current.timeLoc = gl.getUniformLocation(program, 'u_time')
      buffersRef.current.centerLoc = gl.getUniformLocation(program, 'u_center')
      buffersRef.current.windLoc = gl.getUniformLocation(program, 'u_windStrength')

      // Create buffers
      buffersRef.current.positionBuffer = gl.createBuffer()
      buffersRef.current.sizeBuffer = gl.createBuffer()
      buffersRef.current.colorBuffer = gl.createBuffer()
      buffersRef.current.opacityBuffer = gl.createBuffer()
      buffersRef.current.phaseBuffer = gl.createBuffer()
      buffersRef.current.charIndexBuffer = gl.createBuffer()

      // Create font texture
      buffersRef.current.texture = createFontAtlas(gl)
      buffersRef.current.textureLoc = gl.getUniformLocation(program, 'u_fontTexture')
    }

    const program = programRef.current
    const buffers = buffersRef.current

    // Generate flower points
    const cx = dimensions.width / 2
    const cy = dimensions.height / 2
    const scale = Math.min(dimensions.width, dimensions.height) / 450

    const generator = GENERATORS[flowerType] || generateRose
    const points = generator(cx, cy, scale)

    // Prepare data arrays
    const positions = new Float32Array(points.length * 2)
    const sizes = new Float32Array(points.length)
    const colors = new Float32Array(points.length * 3)
    const opacities = new Float32Array(points.length)
    const phases = new Float32Array(points.length)
    const charIndices = new Float32Array(points.length)

    points.forEach((p, i) => {
      positions[i * 2] = p.x
      positions[i * 2 + 1] = p.y
      sizes[i] = p.size * 4  // Properly sized characters
      colors[i * 3] = p.color[0]
      colors[i * 3 + 1] = p.color[1]
      colors[i * 3 + 2] = p.color[2]
      opacities[i] = p.opacity
      phases[i] = Math.random() * Math.PI * 2
      // Proper charIndex handling
      charIndices[i] = p.charIndex !== undefined ? p.charIndex : Math.floor(Math.random() * 16)
    })

    // Upload data to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sizeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.opacityBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, opacities, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.phaseBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, phases, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.charIndexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, charIndices, gl.STATIC_DRAW)

    const pointCount = points.length
    let startTime = performance.now()

    const render = (now) => {
      const time = (now - startTime) * 0.001

      gl.viewport(0, 0, dimensions.width, dimensions.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.useProgram(program)

      // Bind texture
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, buffers.texture)
      gl.uniform1i(buffers.textureLoc, 0)

      // Set uniforms
      gl.uniform2f(buffersRef.current.resolutionLoc, dimensions.width, dimensions.height)
      gl.uniform1f(buffersRef.current.timeLoc, time)
      gl.uniform2f(buffersRef.current.centerLoc, cx, cy)
      gl.uniform1f(buffersRef.current.windLoc, windStrength)

      // Bind attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer)
      gl.enableVertexAttribArray(buffers.positionLoc)
      gl.vertexAttribPointer(buffers.positionLoc, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sizeBuffer)
      gl.enableVertexAttribArray(buffers.sizeLoc)
      gl.vertexAttribPointer(buffers.sizeLoc, 1, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer)
      gl.enableVertexAttribArray(buffers.colorLoc)
      gl.vertexAttribPointer(buffers.colorLoc, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.opacityBuffer)
      gl.enableVertexAttribArray(buffers.opacityLoc)
      gl.vertexAttribPointer(buffers.opacityLoc, 1, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.phaseBuffer)
      gl.enableVertexAttribArray(buffers.phaseLoc)
      gl.vertexAttribPointer(buffers.phaseLoc, 1, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.charIndexBuffer)
      gl.enableVertexAttribArray(buffers.charIndexLoc)
      gl.vertexAttribPointer(buffers.charIndexLoc, 1, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.POINTS, 0, pointCount)

      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [dimensions])

  if (!webglSupported) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
