"use client"
import React from "react"
interface StatusIndicatorProps {
  title: string
  status: string
  value: string
}

export function StatusIndicator({ title, status, value }: StatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational":
      case "running":
      case "normal":
      case "optimal":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} animate-pulse`} />
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
