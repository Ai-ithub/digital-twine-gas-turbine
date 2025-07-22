"use client"
import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface NoiseChartProps {
  data: Array<{ time: string; amplitude: number }>
}

export function NoiseChart({ data }: NoiseChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="1 1" stroke="#374151" />
        <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} interval="preserveStartEnd" />
        <YAxis stroke="#9CA3AF" fontSize={10} domain={[-20, 20]} />
        <Line type="monotone" dataKey="amplitude" stroke="#10b981" strokeWidth={1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
