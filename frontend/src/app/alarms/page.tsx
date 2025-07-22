"use client"
import React from "react"
import { useState } from "react"
import { AlertTriangle, Bell, X } from "lucide-react"

interface Alarm {
  id: number
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  timestamp: Date
  acknowledged: boolean
  source: string
}

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: 1,
      title: "High Vibration Detected",
      description: "Vibration levels exceed 2.5 mm/s threshold",
      severity: "critical",
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
      source: "Vibration Sensor 01",
    },
    {
      id: 2,
      title: "Temperature Warning",
      description: "Outlet temperature approaching upper limit",
      severity: "warning",
      timestamp: new Date(Date.now() - 600000),
      acknowledged: false,
      source: "Temperature Probe 02",
    },
    {
      id: 3,
      title: "Pressure Fluctuation",
      description: "Inlet pressure showing irregular patterns",
      severity: "warning",
      timestamp: new Date(Date.now() - 900000),
      acknowledged: true,
      source: "Pressure Sensor 01",
    },
    {
      id: 4,
      title: "System Information",
      description: "Scheduled maintenance reminder",
      severity: "info",
      timestamp: new Date(Date.now() - 1200000),
      acknowledged: false,
      source: "Maintenance System",
    },
  ])

  const acknowledgeAlarm = (id: number) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, acknowledged: true } : alarm)))
  }

  const dismissAlarm = (id: number) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
  }

  const activeAlarms = alarms.filter((alarm) => !alarm.acknowledged)
  const criticalCount = alarms.filter((alarm) => alarm.severity === "critical" && !alarm.acknowledged).length
  const warningCount = alarms.filter((alarm) => alarm.severity === "warning" && !alarm.acknowledged).length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Alarm Systems</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-red-600 text-white text-sm rounded-full flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Critical: {criticalCount}
          </div>
          <div className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full flex items-center gap-1">
            <Bell className="h-3 w-3" />
            Warnings: {warningCount}
          </div>
          <div className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
            Total Active: {activeAlarms.length}
          </div>
        </div>
      </div>

      {/* Active Alarms */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alarms
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {activeAlarms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No active alarms</div>
            ) : (
              activeAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-lg border ${
                    alarm.severity === "critical"
                      ? "bg-red-900/20 border-red-600"
                      : alarm.severity === "warning"
                        ? "bg-yellow-900/20 border-yellow-600"
                        : "bg-blue-900/20 border-blue-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">{alarm.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            alarm.severity === "critical"
                              ? "bg-red-600 text-white"
                              : alarm.severity === "warning"
                                ? "bg-yellow-600 text-white"
                                : "bg-blue-600 text-white"
                          }`}
                        >
                          {alarm.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{alarm.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Source: {alarm.source}</span>
                        <span>Time: {alarm.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acknowledgeAlarm(alarm.id)}
                        className="px-3 py-1 text-sm border border-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Acknowledge
                      </button>
                      <button onClick={() => dismissAlarm(alarm.id)} className="p-1 text-gray-400 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alarm History */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Alarm History</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {alarms
              .filter((alarm) => alarm.acknowledged)
              .map((alarm) => (
                <div key={alarm.id} className="p-3 bg-gray-700 rounded border border-gray-600 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">{alarm.title}</h4>
                      <p className="text-gray-400 text-xs">{alarm.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">ACKNOWLEDGED</span>
                      <div className="text-xs text-gray-400 mt-1">{alarm.timestamp.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
