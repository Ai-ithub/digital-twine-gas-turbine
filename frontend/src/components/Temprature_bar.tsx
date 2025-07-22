"use client"
import React from "react"
interface TemperatureBarProps {
  label: string
  value: number
  max: number
}

export function TemperatureBar({ label, value, max }: TemperatureBarProps) {
  const percentage = (value / max) * 100

  const getColor = (val: number) => {
    if (val < 30) return "bg-blue-500"
    if (val < 60) return "bg-green-500"
    if (val < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-white font-mono">{value.toFixed(1)}°C</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
