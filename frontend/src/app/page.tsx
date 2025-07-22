"use client"

import { useState, useEffect } from "react"
import "./global.css"
import React from "react"
import { StatusIndicator } from "../components/Status_indicator"
import { CircularGauge } from "../components/CircularGauge"
import { TemperatureBar } from "../components/Temprature_bar"
import { RealtimeChart } from "../components/RealTime_chart"
export default function HomePage() {
  const [sensorData, setSensorData] = useState({
    pressure: 85,
    temperature: 72,
    vibration: 2.3,
    flow: 450,
    efficiency: 92,
    power: 1250,
  })

  const [systemStatus, setSystemStatus] = useState({
    overall: "operational",
    compressor: "running",
    cooling: "normal",
    lubrication: "optimal",
  })

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        pressure: Math.max(0, Math.min(100, prev.pressure + (Math.random() - 0.5) * 5)),
        temperature: Math.max(0, Math.min(100, prev.temperature + (Math.random() - 0.5) * 3)),
        vibration: Math.max(0, Math.min(10, prev.vibration + (Math.random() - 0.5) * 0.5)),
        flow: Math.max(0, Math.min(1000, prev.flow + (Math.random() - 0.5) * 20)),
        efficiency: Math.max(0, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 2)),
        power: Math.max(0, Math.min(2000, prev.power + (Math.random() - 0.5) * 50)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
        <p className="text-gray-400">Real-time monitoring of SGT-400 compressor system</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusIndicator title="System Status" status={systemStatus.overall} value="Operational" />
        <StatusIndicator title="Compressor" status={systemStatus.compressor} value="Running" />
        <StatusIndicator title="Cooling System" status={systemStatus.cooling} value="Normal" />
        <StatusIndicator title="Lubrication" status={systemStatus.lubrication} value="Optimal" />
      </div>

      {/* Main Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Pressure</h3>
          <CircularGauge value={sensorData.pressure} max={100} unit="bar" color="#10b981" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Temperature</h3>
          <CircularGauge value={sensorData.temperature} max={100} unit="°C" color="#f59e0b" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Efficiency</h3>
          <CircularGauge value={sensorData.efficiency} max={100} unit="%" color="#3b82f6" />
        </div>
      </div>

      {/* Temperature Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Temperature Distribution</h3>
          <div className="space-y-4">
            <TemperatureBar label="Inlet" value={45} max={100} />
            <TemperatureBar label="Stage 1" value={sensorData.temperature} max={100} />
            <TemperatureBar label="Stage 2" value={sensorData.temperature + 10} max={100} />
            <TemperatureBar label="Outlet" value={sensorData.temperature + 15} max={100} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Flow Rate</span>
              <span className="text-white font-mono">{sensorData.flow.toFixed(0)} m³/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Power Consumption</span>
              <span className="text-white font-mono">{sensorData.power.toFixed(0)} kW</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Vibration Level</span>
              <span className="text-white font-mono">{sensorData.vibration.toFixed(1)} mm/s</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Operating Hours</span>
              <span className="text-white font-mono">8,247 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Real-time Trends</h3>
        <RealtimeChart />
      </div>
    </div>
  )
}