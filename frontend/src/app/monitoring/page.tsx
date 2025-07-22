"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Activity, Zap, Thermometer, Gauge } from "lucide-react"

export default function MonitoringPage() {
  const [realTimeData, setRealTimeData] = useState({
    pressure: 85.2,
    temperature: 72.8,
    vibration: 2.1,
    power: 1245,
    efficiency: 94.2,
    flow: 456,
  })

  const [alerts, setAlerts] = useState([
    { id: 1, message: "Vibration levels within normal range", type: "info", time: "10:30:15" },
    { id: 2, message: "Temperature spike detected at 10:25", type: "warning", time: "10:25:32" },
    { id: 3, message: "System operating efficiently", type: "success", time: "10:20:45" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        pressure: Math.max(0, Math.min(120, prev.pressure + (Math.random() - 0.5) * 2)),
        temperature: Math.max(0, Math.min(100, prev.temperature + (Math.random() - 0.5) * 1.5)),
        vibration: Math.max(0, Math.min(10, prev.vibration + (Math.random() - 0.5) * 0.3)),
        power: Math.max(0, Math.min(2000, prev.power + (Math.random() - 0.5) * 30)),
        efficiency: Math.max(0, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 1)),
        flow: Math.max(0, Math.min(800, prev.flow + (Math.random() - 0.5) * 15)),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Real-Time Operations</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-green-600 text-white text-sm rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Live Monitoring
          </div>
          <div className="text-gray-400 text-sm">Last Update: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Pressure</h3>
            <Gauge className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">{realTimeData.pressure.toFixed(1)} bar</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(realTimeData.pressure / 120) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Temperature</h3>
            <Thermometer className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2">{realTimeData.temperature.toFixed(1)}°C</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(realTimeData.temperature / 100) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Power</h3>
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{realTimeData.power.toFixed(0)} kW</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(realTimeData.power / 2000) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Vibration</h3>
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">{realTimeData.vibration.toFixed(1)} mm/s</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(realTimeData.vibration / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Efficiency</h3>
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">{realTimeData.efficiency.toFixed(1)}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${realTimeData.efficiency}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Flow Rate</h3>
            <div className="w-6 h-6 bg-cyan-400 rounded-full"></div>
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-2">{realTimeData.flow.toFixed(0)} m³/h</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(realTimeData.flow / 800) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live Alerts */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Live System Alerts</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.type === "warning"
                    ? "bg-yellow-900/20 border-yellow-600"
                    : alert.type === "success"
                      ? "bg-green-900/20 border-green-600"
                      : "bg-blue-900/20 border-blue-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{alert.message}</span>
                  <span className="text-gray-400 text-xs">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
