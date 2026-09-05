import { buildFlowerGeometry } from './flowerMeshes'
import { getFlower } from './flowerCatalog'

// Render the moving 3D lotus into a low-resolution color/depth buffer, then
// redraw it on a fixed ASCII grid. Letters change; they never stretch with petals.
const VERTEX = `
  precision highp float;
  attribute vec3 a_position;
  attribute vec3 a_normal;
  attribute vec3 a_color;
  attribute vec4 a_data;
  uniform float u_time;
  uniform float u_motion;
  uniform float u_lightMode;
  uniform float u_reflection;
  uniform vec3 u_petalRoot;
  uniform vec3 u_petalTip;
  uniform vec3 u_shadow;
  uniform vec3 u_highlight;
  uniform vec3 u_water;
  uniform vec3 u_stem;
  uniform vec3 u_gold;
  uniform vec2 u_resolution;
  uniform float u_largeView;
  uniform float u_targetHeight;
  uniform float u_zoom;
  uniform vec2 u_pointer;
  varying vec3 v_color;
  varying float v_alpha;

  void main() {
    float t = u_time;
    float kind = a_data.w;
    vec3 p = a_position;
    vec3 n = a_normal;
    float gust = (0.085 * sin(t * 0.85) + 0.045 * sin(t * 1.71 + 0.6)) * u_motion;
    if (kind < 2.5) {
      // Petals flex independently but share the same traveling wind.
      float flutter = (sin(t * 2.7 + a_data.z) * 0.032 + sin(t * 1.3 + a_data.z) * 0.045) * a_data.y * u_motion;
      p += n * flutter;
      float bend = gust * max(p.y, 0.0);
      p.xy = mat2(cos(bend), sin(bend), -sin(bend), cos(bend)) * p.xy;
      n.xy = mat2(cos(bend), sin(bend), -sin(bend), cos(bend)) * n.xy;
      p.z += sin(t * 0.75 + 0.7) * 0.09 * p.y * u_motion;
    } else {
      p.y += sin(p.x * 3.0 + p.z * 4.0 - t * 1.7) * 0.013 * u_motion;
    }
    float fade = 1.0;
    if (u_reflection > 0.5) {
      fade = mix(0.20, 0.32, u_lightMode) * exp(-p.y * 1.0);
      p.y = -p.y * 0.58 - 0.04;
      p.x += sin(p.y * 23.0 + t * 1.4) * (0.015 + abs(p.y) * 0.016) * u_motion;
    }
    float yaw = 0.3 + (sin(t * 0.24) * 0.10 + u_pointer.x * 0.28) * u_motion;
    p.xz = mat2(cos(yaw), sin(yaw), -sin(yaw), cos(yaw)) * p.xz;
    n.xz = mat2(cos(yaw), sin(yaw), -sin(yaw), cos(yaw)) * n.xz;
    float pitch = 0.40 + u_pointer.y * 0.065 * u_motion;
    p.y -= u_targetHeight;
    float viewY = p.y * cos(pitch) - p.z * sin(pitch);
    float depth = 7.5 - (p.z * cos(pitch) + p.y * sin(pitch));
    float aspect = u_resolution.x / u_resolution.y;
    float lens = mix(min(3.5, aspect * 3.1), min(4.5, aspect * 3.6), u_largeView);
    gl_Position = vec4(p.x * lens * u_zoom / aspect, viewY * lens * u_zoom, (depth - 0.1) * 1.01 - 0.1, depth);
    gl_PointSize = kind > 2.5 ? 1.0 : 1.5;
    vec3 facingNormal = normalize(n);
    if (dot(facingNormal, vec3(0.0, 0.4, 1.0)) < 0.0) facingNormal *= -1.0;
    float diffuse = max(0.0, dot(facingNormal, normalize(vec3(-0.8, 1.0, 0.6))));
    float u = sqrt(a_data.y);
    float edge = a_color.b;
    float rootShade = mix(0.58, 1.0, smoothstep(0.0, 0.32, u));
    float ridge = pow(max(0.0, 1.0 - edge), 4.0) * smoothstep(0.1, 0.55, u) * 0.15;
    float illumination = clamp((0.12 + 0.88 * diffuse) * a_color.r * rootShade + ridge, 0.05, 1.0);
    float blush = clamp((0.96 - a_color.g) / 0.56, 0.0, 1.0);
    vec3 pigment = mix(u_petalRoot, u_petalTip, blush);
    v_color = mix(u_shadow, pigment, illumination);
    float sheen = pow(max(0.0, dot(facingNormal, normalize(vec3(-0.4, 0.8, 1.0)))), 16.0);
    float rim = pow(edge, 5.0) * diffuse;
    v_color = mix(v_color, u_highlight, min(0.48, sheen * 0.32 + rim * 0.20));
    if (kind > 0.5 && kind < 1.5) v_color = u_gold * a_color.r;
    if (kind > 1.5 && kind < 2.5) v_color = u_stem;
    v_alpha = fade;
    if (kind > 2.5) {
      v_color = u_water;
      v_alpha *= a_color.r * mix(1.0, 1.8, u_lightMode) * (0.31 + 0.055 * sin(a_data.z - t * 0.9));
    }

  }
`
const SURFACE_FRAGMENT = `
  precision highp float;
  uniform float u_reflection;
  varying vec3 v_color;
  varying float v_alpha;
  void main() {
    float alpha = v_alpha;
    if (u_reflection > 0.5) alpha *= mix(0.4, 1.0, step(1.0, mod(gl_FragCoord.y, 3.0)));
    gl_FragColor = vec4(v_color * alpha, alpha);
  }
`
const ASCII_VERTEX = `
  attribute vec2 a_screen;
  void main() { gl_Position = vec4(a_screen, 0.0, 1.0); }
`
const ASCII_FRAGMENT = `
  precision highp float;
  uniform sampler2D u_scene;
  uniform sampler2D u_atlas;
  uniform vec2 u_grid;
  uniform vec2 u_cell;
  uniform float u_time;
  uniform float u_motion;
  uniform float u_lightMode;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 cell = floor(gl_FragCoord.xy / u_cell);
    vec4 sampleColor = texture2D(u_scene, (cell + 0.5) / u_grid);
    if (sampleColor.a < 0.015) discard;
    vec3 color = sampleColor.rgb / max(sampleColor.a, 0.001);
    float light = dot(color, vec3(0.299, 0.587, 0.114));
    // Staggered substitutions avoid a synchronized flash. Similar ink densities
    // keep the image readable as characters change, even between wind gusts.
    float seed = hash(cell);
    float stepTime = floor(u_time * 1.8 * u_motion + seed * 11.0);
    float variation = floor(hash(cell + stepTime * vec2(13.7, 9.2)) * 3.0);
    float density = mix(light, 1.0 - light, u_lightMode);
    float glyph = clamp(floor(density * 10.0) + 2.0 + variation, 3.0, 13.0);
    if (sampleColor.a < 0.75) glyph = 14.0 + step(0.28, seed);
    vec2 local = fract(gl_FragCoord.xy / u_cell);
    local.y = 1.0 - local.y;
    vec2 atlasCell = vec2(mod(glyph, 8.0), floor(glyph / 8.0));
    float ink = texture2D(u_atlas, (atlasCell + local) / vec2(8.0, 2.0)).a;
    float alpha = ink * sampleColor.a;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`
const STRIDE = 13
// Independent palettes keep the bloom and water legible on each background.
const PALETTES = {
  blue: { petalRoot: '#fff1dc', petalTip: '#ff83c1', shadow: '#785296', highlight: '#fff4ec', water: '#a3d9ef', stem: '#8fbc9d', gold: '#ffe3a1' },
  dark: { petalRoot: '#fff0da', petalTip: '#f49ccf', shadow: '#64427e', highlight: '#fff2e5', water: '#8cb8c2', stem: '#87aa91', gold: '#f6d186' },
  light: { petalRoot: '#92305e', petalTip: '#b53774', shadow: '#3c173e', highlight: '#c25b86', water: '#315e72', stem: '#34563b', gold: '#805415' },
}
function rgb(hex) {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255)
}

export function createAsciiLotusScene(canvas, theme) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true })
  if (!gl) throw new Error('WebGL is unavailable')
  const resources = { shaders: [], programs: [], buffers: [] }
  function shader(type, source) {
    const item = gl.createShader(type)
    resources.shaders.push(item)
    gl.shaderSource(item, source)
    gl.compileShader(item)
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item))
    return item
  }
  function program(vertex, fragment, names) {
    const item = gl.createProgram()
    resources.programs.push(item)
    gl.attachShader(item, shader(gl.VERTEX_SHADER, vertex))
    gl.attachShader(item, shader(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(item)
    if (!gl.getProgramParameter(item, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(item))
    const uniforms = {}
    for (const name of names) uniforms[name] = gl.getUniformLocation(item, `u_${name}`)
    return { item, uniforms }
  }
  const surface = program(VERTEX, SURFACE_FRAGMENT, ['time', 'motion', 'lightMode', 'reflection', 'resolution', 'largeView', 'targetHeight', 'zoom', 'pointer', 'petalRoot', 'petalTip', 'shadow', 'highlight', 'water', 'stem', 'gold'])
  const ascii = program(ASCII_VERTEX, ASCII_FRAGMENT, ['scene', 'atlas', 'grid', 'cell', 'time', 'motion', 'lightMode'])
  let currentTheme = theme
  let selectedFlower = getFlower('lotus')
  let lightMode = theme === 'light'
  function flowerPalette() {
    const colors = { ...(PALETTES[currentTheme] || PALETTES.blue) }
    const flowerColors = lightMode ? selectedFlower.light : selectedFlower.palette
    if (flowerColors) ['petalRoot', 'petalTip', 'shadow', 'highlight', 'gold'].forEach((name, i) => { colors[name] = flowerColors[i] })
    return Object.fromEntries(Object.entries(colors).map(([name, color]) => [name, rgb(color)]))
  }
  let palette = flowerPalette()
  const attributes = ['position', 'normal', 'color', 'data'].map(name => gl.getAttribLocation(surface.item, `a_${name}`))
  const screenAttribute = gl.getAttribLocation(ascii.item, 'a_screen')
  function buffer(data) {
    const item = gl.createBuffer()
    resources.buffers.push(item)
    gl.bindBuffer(gl.ARRAY_BUFFER, item)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    return item
  }
  function texture(filter) {
    const item = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, item)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return item
  }
  const atlas = document.createElement('canvas')
  atlas.width = 192
  atlas.height = 80
  const font = atlas.getContext('2d')
  font.font = '34px Menlo, Consolas, monospace'
  font.textAlign = 'center'
  font.textBaseline = 'middle'
  font.fillStyle = '#fff'
  Array.from(' .,:;+=x*o%#@&~-').forEach((char, i) => font.fillText(char, i % 8 * 24 + 12, Math.floor(i / 8) * 40 + 21))
  const fontTexture = texture(gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
  const sceneTexture = texture(gl.NEAREST)
  const framebuffer = gl.createFramebuffer()
  const depthBuffer = gl.createRenderbuffer()
  const quad = buffer(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]))
  const meshes = {}
  const geometryCache = new Map()
  function getGeometry(id) {
    if (!geometryCache.has(id)) {
      geometryCache.set(id, buildFlowerGeometry(id))
      if (geometryCache.size > 3) geometryCache.delete(geometryCache.keys().next().value)
    }
    return geometryCache.get(id)
  }
  for (const [name, data] of Object.entries(getGeometry('lotus'))) meshes[name] = { buffer: buffer(data), count: data.length / STRIDE }

  let width = 1, height = 1, dpr = 1, columns = 1, rows = 1, cellX = 1, cellY = 1
  let largeView = false
  let frame = 0, previous = 0, elapsed = 0, active = true, ready = false
  const pointer = [0, 0], target = [0, 0]
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function drawMesh(mesh, reflection, mode) {
    gl.uniform1f(surface.uniforms.reflection, reflection)
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer)
    let offset = 0
    attributes.forEach((location, i) => {
      const size = i === 3 ? 4 : 3
      if (location >= 0) {
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, STRIDE * 4, offset * 4)
      }
      offset += size
    })
    gl.drawArrays(mode, 0, mesh.count)
  }
  function draw() {
    if (!ready) return
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.viewport(0, 0, columns, rows)
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)
    gl.disable(gl.BLEND)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(surface.item)
    const u = surface.uniforms
    gl.uniform1f(u.time, elapsed)
    gl.uniform1f(u.motion, motion.matches ? 0 : 1)
    gl.uniform1f(u.lightMode, lightMode ? 1 : 0)
    for (const [name, color] of Object.entries(palette)) gl.uniform3fv(u[name], color)
    gl.uniform2f(u.resolution, width, height)
    gl.uniform1f(u.largeView, largeView ? 1 : 0)
    gl.uniform1f(u.targetHeight, selectedFlower.target)
    gl.uniform1f(u.zoom, selectedFlower.zoom)
    gl.uniform2f(u.pointer, pointer[0], pointer[1])
    // Each pass resolves visibility in 3D before any characters are drawn.
    drawMesh(meshes.surface, 1, gl.TRIANGLES)
    drawMesh(meshes.points, 1, gl.POINTS)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    drawMesh(meshes.surface, 0, gl.TRIANGLES)
    drawMesh(meshes.points, 0, gl.POINTS)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    drawMesh(meshes.water, 0, gl.POINTS)
    attributes.forEach(location => { if (location >= 0) gl.disableVertexAttribArray(location) })

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(ascii.item)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, fontTexture)
    gl.uniform1i(ascii.uniforms.scene, 0)
    gl.uniform1i(ascii.uniforms.atlas, 1)
    gl.uniform2f(ascii.uniforms.grid, columns, rows)
    gl.uniform2f(ascii.uniforms.cell, cellX, cellY)
    gl.uniform1f(ascii.uniforms.time, elapsed)
    gl.uniform1f(ascii.uniforms.motion, motion.matches ? 0 : 1)
    gl.uniform1f(ascii.uniforms.lightMode, lightMode ? 1 : 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.enableVertexAttribArray(screenAttribute)
    gl.vertexAttribPointer(screenAttribute, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.disableVertexAttribArray(screenAttribute)
  }
  function tick(now) {
    frame = 0
    if (!active || document.hidden || motion.matches) return
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    previous = now
    elapsed += delta
    const response = 1 - Math.exp(-delta * 3)
    pointer[0] += (target[0] - pointer[0]) * response
    pointer[1] += (target[1] - pointer[1]) * response
    draw()
    frame = requestAnimationFrame(tick)
  }
  function sync() {
    cancelAnimationFrame(frame)
    previous = 0
    draw()
    if (active && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick)
  }
  function move(event) {
    const rect = canvas.getBoundingClientRect()
    target[0] = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
    target[1] = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
  }
  function leave() { target[0] = 0; target[1] = 0 }
  const resize = new ResizeObserver(([entry]) => {
    largeView = window.matchMedia('(min-width: 1024px)').matches
    width = Math.max(1, entry.contentRect.width)
    height = Math.max(1, entry.contentRect.height)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const glyphWidth = width < 500 ? 4 : 6
    columns = Math.ceil(width / glyphWidth)
    rows = Math.ceil(height / (glyphWidth * 1.4))
    cellX = canvas.width / columns
    cellY = canvas.height / rows
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columns, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, columns, rows)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)
    ready = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    draw()
  })
  resize.observe(canvas)
  const intersection = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; sync() })
  intersection.observe(canvas)
  window.addEventListener('pointermove', move, { passive: true })
  document.documentElement.addEventListener('pointerleave', leave)
  document.addEventListener('visibilitychange', sync)
  motion.addEventListener('change', sync)
  sync()
  return {
    setTheme(nextTheme) {
      currentTheme = nextTheme
      lightMode = nextTheme === 'light'
      palette = flowerPalette()
      draw()
    },
    setFlower(id) {
      const flower = getFlower(id)
      if (flower.id === selectedFlower.id) return
      const geometry = getGeometry(flower.id)
      for (const [name, data] of Object.entries(geometry)) {
        gl.bindBuffer(gl.ARRAY_BUFFER, meshes[name].buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        meshes[name].count = data.length / STRIDE
      }
      selectedFlower = flower
      palette = flowerPalette()
      draw()
    },
    dispose() {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      resources.buffers.forEach(item => gl.deleteBuffer(item))
      resources.programs.forEach(item => gl.deleteProgram(item))
      resources.shaders.forEach(item => gl.deleteShader(item))
      gl.deleteTexture(fontTexture)
      gl.deleteTexture(sceneTexture)
      gl.deleteFramebuffer(framebuffer)
      gl.deleteRenderbuffer(depthBuffer)
      geometryCache.clear()
    },
  }
}
