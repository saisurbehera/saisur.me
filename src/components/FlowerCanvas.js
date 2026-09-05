import { useEffect, useRef, useState } from 'react'
import { createAsciiLotusScene } from './flowers/asciiLotusScene'

export function FlowerCanvas({ theme = 'blue' }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    try {
      const scene = createAsciiLotusScene(canvasRef.current, 'blue')
      sceneRef.current = scene
      return () => {
        scene.dispose()
        sceneRef.current = null
      }
    } catch (error) {
      console.error('Unable to render the character lotus:', error)
      setUnavailable(true)
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.setTheme(theme)
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="lotus-canvas"
      role="img"
      aria-label="A three-dimensional pink lotus redrawn in changing characters, swaying in the wind above rippling water."
    >
      {unavailable ? 'The animated lotus requires WebGL.' : 'A pink lotus swaying in the wind.'}
    </canvas>
  )
}
