"use client"
import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface HistogramChartProps {
  data: Array<{ range: string; frequency: number }>
}

export function HistogramChart({ data }: HistogramChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="range" stroke="#9CA3AF" fontSize={10} />
        <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 3]} />
        <Bar dataKey="frequency" fill="#dc2626" stroke="#dc2626" />
      </BarChart>
    </ResponsiveContainer>
  )
}
