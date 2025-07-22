"use client"
import React from "react"
import { useState } from "react"
import { Settings, Power, Play, Pause, Square } from "lucide-react"

export default function ControlPage() {
  const [controlMode, setControlMode] = useState("auto")
  const [systemState, setSystemState] = useState("running")
  const [parameters, setParameters] = useState({
    targetPressure: 85,
    targetTemperature: 75,
    flowRate: 450,
    speed: 3600,
  })

  const handleParameterChange = (param: string, value: number) => {
    setParameters((prev) => ({ ...prev, [param]: value }))
  }

  const handleSystemControl = (action: string) => {
    setSystemState(action)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">System Control</h1>
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              systemState === "running"
                ? "bg-green-600 text-white"
                : systemState === "stopped"
                  ? "bg-red-600 text-white"
                  : "bg-yellow-600 text-white"
            }`}
          >
            Status: {systemState.charAt(0).toUpperCase() + systemState.slice(1)}
          </div>
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              controlMode === "auto" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
            }`}
          >
            Mode: {controlMode.charAt(0).toUpperCase() + controlMode.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Control Panel
            </h2>
          </div>
          <div className="p-4 space-y-6">
            {/* Control Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Control Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setControlMode("auto")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    controlMode === "auto" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Automatic
                </button>
                <button
                  onClick={() => setControlMode("manual")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    controlMode === "manual"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* System Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">System Controls</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSystemControl("running")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
                <button
                  onClick={() => handleSystemControl("paused")}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
                <button
                  onClick={() => handleSystemControl("stopped")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </div>
            </div>

            {/* Emergency Stop */}
            <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">
                <Power className="h-5 w-5" />
                EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>

        {/* Parameter Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Parameter Settings</h2>
          </div>
          <div className="p-4 space-y-6">
            {/* Target Pressure */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Pressure: {parameters.targetPressure} bar
              </label>
              <input
                type="range"
                min="50"
                max="120"
                value={parameters.targetPressure}
                onChange={(e) => handleParameterChange("targetPressure", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={controlMode === "auto"}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50</span>
                <span>120</span>
              </div>
            </div>

            {/* Target Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Temperature: {parameters.targetTemperature}°C
              </label>
              <input
                type="range"
                min="40"
                max="100"
                value={parameters.targetTemperature}
                onChange={(e) => handleParameterChange("targetTemperature", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={controlMode === "auto"}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>40</span>
                <span>100</span>
              </div>
            </div>

            {/* Flow Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flow Rate: {parameters.flowRate} m³/h
              </label>
              <input
                type="range"
                min="200"
                max="800"
                value={parameters.flowRate}
                onChange={(e) => handleParameterChange("flowRate", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={controlMode === "auto"}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>200</span>
                <span>800</span>
              </div>
            </div>

            {/* Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Speed: {parameters.speed} RPM</label>
              <input
                type="range"
                min="1000"
                max="5000"
                value={parameters.speed}
                onChange={(e) => handleParameterChange("speed", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={controlMode === "auto"}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1000</span>
                <span>5000</span>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Apply Settings
            </button>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Current Status</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Current Pressure</div>
              <div className="text-white text-xl font-bold">82.5 bar</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Current Temperature</div>
              <div className="text-white text-xl font-bold">73.2°C</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Current Flow</div>
              <div className="text-white text-xl font-bold">445 m³/h</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Current Speed</div>
              <div className="text-white text-xl font-bold">3580 RPM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
