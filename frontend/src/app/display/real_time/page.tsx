"use client"

import { useState } from "react"
import { HistogramChart } from "../../../components/Histogram_chart"
import { NoiseChart } from "../../../components/Noise_chart"

export default function RealtimePage() {
  const [systemParam, setSystemParam] = useState("system_1")
  const [gaugeParam, setGaugeParam] = useState("gauge_1")
  const [sensorParam, setSensorParam] = useState("sensor_1")

  // Generate mock noise data
  const [noiseData, setNoiseData] = useState(() =>
    Array.from({ length: 100 }, (_, i) => ({
      time: (i * 0.01).toFixed(3),
      amplitude: Math.sin(i * 0.1) * 10 + Math.random() * 5 - 2.5,
    })),
  )

  // Generate mock histogram data
  const histogramData = [
    { range: "-6", frequency: 0.2 },
    { range: "-5", frequency: 0.5 },
    { range: "-4", frequency: 1.2 },
    { range: "-3", frequency: 2.1 },
    { range: "-2", frequency: 2.8 },
    { range: "-1", frequency: 2.5 },
    { range: "0", frequency: 2.2 },
    { range: "1", frequency: 2.4 },
    { range: "2", frequency: 2.6 },
    { range: "3", frequency: 1.8 },
    { range: "4", frequency: 1.1 },
    { range: "5", frequency: 0.4 },
    { range: "6", frequency: 0.1 },
  ]

  return (
    <div className="flex-1 bg-black text-white">
      {/* Top Section with Dropdowns */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-6 max-w-4xl">
          <div className="flex flex-col">
            <label className="text-white text-sm mb-2 font-medium">System</label>
            <select
              value={systemParam}
              onChange={(e) => setSystemParam(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-2 text-sm rounded"
            >
              <option value="system_1">System 1</option>
              <option value="system_2">System 2</option>
              <option value="system_3">System 3</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-2 font-medium">Gauge_parameter</label>
            <select
              value={gaugeParam}
              onChange={(e) => setGaugeParam(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-2 text-sm rounded"
            >
              <option value="gauge_1">Gauge Parameter 1</option>
              <option value="gauge_2">Gauge Parameter 2</option>
              <option value="gauge_3">Gauge Parameter 3</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-2 font-medium">sensor_parameter</label>
            <select
              value={sensorParam}
              onChange={(e) => setSensorParam(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-2 text-sm rounded"
            >
              <option value="sensor_1">Sensor Parameter 1</option>
              <option value="sensor_2">Sensor Parameter 2</option>
              <option value="sensor_3">Sensor Parameter 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Graph Section Header */}
      <div className="bg-gray-600 text-center py-3 border-b border-gray-500">
        <h2 className="text-white font-medium text-lg">Graph</h2>
      </div>

      {/* Charts Container */}
      <div className="p-4 space-y-6">
        {/* Noise Signal Chart */}
        <div className="bg-gray-800 border border-gray-600 rounded">
          <div className="p-3 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Noise Signal</h3>
              <div className="text-white text-sm">
                <span className="mr-4">20</span>
                <span className="mr-16">Amplitude</span>
                <span className="mr-4">0</span>
                <span>-20</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="h-48 bg-white border border-gray-400 rounded relative">
              <NoiseChart data={noiseData} />
              {/* Y-axis labels */}
              <div className="absolute left-2 top-2 text-black text-xs">20</div>
              <div className="absolute left-2 top-1/2 text-black text-xs">0</div>
              <div className="absolute left-2 bottom-2 text-black text-xs">-20</div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between text-white text-xs mt-2 px-4">
              <span>0</span>
              <span>0.04</span>
              <span>0.08</span>
              <span>0.12</span>
              <span>0.16</span>
              <span>0.2</span>
              <span>0.24</span>
              <span>0.28</span>
              <span>0.32</span>
              <span>0.36</span>
              <span>0.4</span>
              <span>0.44</span>
              <span>0.48</span>
              <span>0.52</span>
              <span>0.56</span>
              <span>0.6</span>
              <span>0.64</span>
              <span>0.68</span>
              <span>0.72</span>
              <span>0.76</span>
              <span>0.8</span>
              <span>0.84</span>
              <span>0.88</span>
              <span>0.92</span>
              <span>0.96</span>
              <span>1</span>
            </div>
          </div>
        </div>

        {/* Histogram Chart */}
        <div className="bg-gray-800 border border-gray-600 rounded">
          <div className="p-3 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Histogram of Noise</h3>
              <div className="text-white text-sm">
                <span className="mr-4">3</span>
                <span className="mr-16">Frequency</span>
                <span>0</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="h-48 bg-white border border-gray-400 rounded relative">
              <HistogramChart data={histogramData} />
              {/* Y-axis labels */}
              <div className="absolute left-2 top-2 text-black text-xs">3</div>
              <div className="absolute left-2 top-1/3 text-black text-xs">2</div>
              <div className="absolute left-2 top-2/3 text-black text-xs">1</div>
              <div className="absolute left-2 bottom-2 text-black text-xs">0</div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between text-white text-xs mt-2 px-4">
              <span>-6</span>
              <span>-5</span>
              <span>-4</span>
              <span>-3</span>
              <span>-2</span>
              <span>-1</span>
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
