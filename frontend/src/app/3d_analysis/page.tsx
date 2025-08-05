"use client"
import React from "react"
export default function ThreeDAnalysisPage() {
  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">3D Analysis Operations</h1>
        <div className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full inline-block">
          3D Visualization Module
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Viewer */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg lg:col-span-2">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">3D Compressor Model</h2>
          </div>
          <div className="p-4">
            <div className="h-96 bg-gray-900 border border-gray-600 rounded flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🔧</div>
                <div className="text-lg">3D Model Viewer</div>
                <div className="text-sm">Interactive 3D visualization would be rendered here</div>
                <div className="text-xs mt-2">Using Three.js or similar 3D library</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">3D Controls</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">View Mode</label>
              <select className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded">
                <option value="full">Full Model</option>
                <option value="cutaway">Cutaway View</option>
                <option value="exploded">Exploded View</option>
                <option value="wireframe">Wireframe</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Component Focus</label>
              <select className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded">
                <option value="all">All Components</option>
                <option value="inlet">Inlet System</option>
                <option value="compressor">Compressor Stage</option>
                <option value="outlet">Outlet System</option>
                <option value="sensors">Sensor Network</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Data Overlay</label>
              <select className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded">
                <option value="none">None</option>
                <option value="temperature">Temperature Map</option>
                <option value="pressure">Pressure Distribution</option>
                <option value="stress">Stress Analysis</option>
                <option value="vibration">Vibration Patterns</option>
              </select>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Reset View
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Take Screenshot
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                Export Model
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Component Analysis */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg mt-6">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Component Analysis</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Inlet Valve", status: "Normal", temperature: "25°C", stress: "Low" },
              { name: "Compressor Blade", status: "Warning", temperature: "87°C", stress: "Medium" },
              { name: "Outlet Manifold", status: "Normal", temperature: "82°C", stress: "Low" },
              { name: "Bearing Assembly", status: "Normal", temperature: "45°C", stress: "Low" },
            ].map((component, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded border border-gray-600">
                <h3 className="text-white font-medium mb-2">{component.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        component.status === "Normal" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                      }`}
                    >
                      {component.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temp:</span>
                    <span className="text-white">{component.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stress:</span>
                    <span className="text-white">{component.stress}</span>
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
