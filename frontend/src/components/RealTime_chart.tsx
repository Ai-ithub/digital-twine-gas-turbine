"use client"
import React from "react"
import { useState, useEffect } from "react"

export function RealtimeChart() {
  const [data, setData] = useState<Array<{ time: string; pressure: number; temperature: number }>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString()

      setData((prev) => {
        const newData = [
          ...prev,
          {
            time: timeStr,
            pressure: 80 + Math.random() * 20,
            temperature: 70 + Math.random() * 15,
          },
        ].slice(-20) // Keep only last 20 points

        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const maxPressure = Math.max(...data.map((d) => d.pressure), 100)
  const maxTemperature = Math.max(...data.map((d) => d.temperature), 100)

  return (
    <div className="h-64 relative">
      <svg width="100%" height="100%" viewBox="0 0 800 200" className="border border-gray-600 rounded">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#374151" strokeWidth="1" />
        ))}

        {/* Pressure line */}
        {data.length > 1 && (
          <polyline
            points={data
              .map((d, i) => `${(i / (data.length - 1)) * 800},${200 - (d.pressure / maxPressure) * 180}`)
              .join(" ")}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        )}

        {/* Temperature line */}
        {data.length > 1 && (
          <polyline
            points={data
              .map((d, i) => `${(i / (data.length - 1)) * 800},${200 - (d.temperature / maxTemperature) * 180}`)
              .join(" ")}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-gray-800 p-2 rounded border border-gray-600">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs text-white">Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-xs text-white">Temperature</span>
        </div>
      </div>
    </div>
  )
}
