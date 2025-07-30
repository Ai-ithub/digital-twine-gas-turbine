"use client"
import React from "react"
import { useState } from "react"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { RealtimeChart } from "../../components/RealTime_chart"

export default function GraphAnalysisPage() {
  const [selectedParameter, setSelectedParameter] = useState("pressure")
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")
  const [analysisType, setAnalysisType] = useState("trend")

  const trendData = [
    { time: "00:00", pressure: 3.5, temperature: 25, vibration: 1.2, efficiency: 82 },
    { time: "04:00", pressure: 3.6, temperature: 27, vibration: 1.1, efficiency: 83 },
    { time: "08:00", pressure: 3.4, temperature: 29, vibration: 1.3, efficiency: 81 },
    { time: "12:00", pressure: 3.7, temperature: 31, vibration: 1.0, efficiency: 84 },
    { time: "16:00", pressure: 3.5, temperature: 28, vibration: 1.2, efficiency: 82 },
    { time: "20:00", pressure: 3.6, temperature: 26, vibration: 1.1, efficiency: 83 },
  ]

  const correlationData = [
    { x: 3.2, y: 80 },
    { x: 3.4, y: 81 },
    { x: 3.5, y: 82 },
    { x: 3.6, y: 83 },
    { x: 3.7, y: 84 },
    { x: 3.8, y: 83 },
    { x: 3.9, y: 82 },
    { x: 4.0, y: 81 },
  ]

  const distributionData = [
    { range: "3.0-3.2", count: 5 },
    { range: "3.2-3.4", count: 12 },
    { range: "3.4-3.6", count: 25 },
    { range: "3.6-3.8", count: 18 },
    { range: "3.8-4.0", count: 8 },
    { range: "4.0-4.2", count: 3 },
  ]

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Graph Analysis</h1>

        {/* Analysis Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Parameter</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="w-48 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            >
              <option value="pressure">Pressure</option>
              <option value="temperature">Temperature</option>
              <option value="vibration">Vibration</option>
              <option value="efficiency">Efficiency</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-32 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-40 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded"
            >
              <option value="trend">Trend Analysis</option>
              <option value="correlation">Correlation</option>
              <option value="distribution">Distribution</option>
              <option value="fft">FFT Analysis</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Generate Analysis</button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg lg:col-span-2">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              {analysisType === "trend" && "Trend Analysis"}
              {analysisType === "correlation" && "Correlation Analysis"}
              {analysisType === "distribution" && "Distribution Analysis"}
              {analysisType === "fft" && "FFT Frequency Analysis"}
            </h2>
          </div>
          <div className="p-4">
            <div className="h-80">
              {analysisType === "trend" && <RealtimeChart />}

              {analysisType === "correlation" && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" stroke="#9CA3AF" />
                    <YAxis dataKey="y" stroke="#9CA3AF" />
                    <Scatter dataKey="y" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {analysisType === "distribution" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {analysisType === "fft" && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  FFT Analysis visualization would be implemented here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Statistical Summary</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[
                { label: "Mean", value: "3.55", unit: "bar" },
                { label: "Std Deviation", value: "0.12", unit: "bar" },
                { label: "Min Value", value: "3.20", unit: "bar" },
                { label: "Max Value", value: "3.95", unit: "bar" },
                { label: "Range", value: "0.75", unit: "bar" },
                { label: "Variance", value: "0.014", unit: "bar²" },
              ].map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">{stat.label}</span>
                  <span className="text-white font-mono">
                    {stat.value} {stat.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Insights */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Analysis Insights</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-900/20 border border-green-600 rounded">
                <div className="text-green-400 font-medium text-sm">Normal Operation</div>
                <div className="text-gray-300 text-xs">Parameters within expected ranges</div>
              </div>
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded">
                <div className="text-yellow-400 font-medium text-sm">Trend Detected</div>
                <div className="text-gray-300 text-xs">Slight upward trend in pressure readings</div>
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-600 rounded">
                <div className="text-blue-400 font-medium text-sm">Correlation Found</div>
                <div className="text-gray-300 text-xs">Strong correlation between pressure and efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
