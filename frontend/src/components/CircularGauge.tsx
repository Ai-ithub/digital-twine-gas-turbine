"use client"
import React from "react"
interface CircularGaugeProps {
  title?:string
  value: number
  max: number
  unit: string
  color: string
  size?: number
}

export function CircularGauge({ title, value, max, unit, color = "#10b981", size = 120 }: CircularGaugeProps) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-md text-center m-3" style={{ color }}>{title}</h3>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" stroke="#374151" strokeWidth="8" fill="none" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
          <span className="text-sm text-gray-400">{unit}</span>
          
        </div>
      </div>
    </div>
  )
}
