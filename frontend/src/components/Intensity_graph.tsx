"use client"
import React from "react"
import { useEffect, useRef } from "react"

export function IntensityGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Create intensity heatmap
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4

        // Create a gradient pattern
        const intensity = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 127 + 128
        const normalizedIntensity = intensity / 255

        // Color mapping (blue to red)
        if (normalizedIntensity < 0.5) {
          data[index] = 0 // Red
          data[index + 1] = Math.floor(normalizedIntensity * 2 * 255) // Green
          data[index + 2] = 255 // Blue
        } else {
          data[index] = Math.floor((normalizedIntensity - 0.5) * 2 * 255) // Red
          data[index + 1] = Math.floor((1 - normalizedIntensity) * 2 * 255) // Green
          data[index + 2] = 0 // Blue
        }
        data[index + 3] = 255 // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Add grid lines
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={400} height={300} className="border border-gray-600 rounded" />

      {/* Color scale */}
      <div className="absolute right-2 top-2 w-6 h-48 bg-gradient-to-t from-blue-500 via-green-500 to-red-500 rounded">
        <div className="absolute -right-8 top-0 text-xs text-white">2500</div>
        <div className="absolute -right-8 top-12 text-xs text-white">2000</div>
        <div className="absolute -right-8 top-24 text-xs text-white">1500</div>
        <div className="absolute -right-8 top-36 text-xs text-white">1000</div>
        <div className="absolute -right-8 bottom-0 text-xs text-white">0</div>
      </div>

      {/* Axis labels */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white">x(t-1)</div>
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-white">x(t)</div>
    </div>
  )
}
