"use client";

import { useEffect, useState } from "react";
import { fetchLatestSensorData, SensorData } from "../../../lib/api";

import { HistogramChart } from "../../../components/Histogram_chart";
import { NoiseChart } from "../../../components/Noise_chart";

export default function RealtimePage() {
  const [systemParam, setSystemParam] = useState("system_1");
  const [gaugeParam, setGaugeParam] = useState("gauge_1");
  const [sensorParam, setSensorParam] = useState("sensor_1");

  const [noiseData, setNoiseData] = useState<{ time: string; amplitude: number }[]>([]);
  const [histogramData, setHistogramData] = useState<{ range: string; frequency: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestSensorData(systemParam, gaugeParam, sensorParam)
        .then((data) => {
          if (!data.length) {
            setError("No sensor data received");
            return;
          }

          const noise = data.map((d) => ({
            time: new Date(d.timestamp).toISOString(),
            amplitude: d.vibration,
          }));
          setNoiseData(noise);

          const bins = new Map<string, number>();
          noise.forEach(({ amplitude }) => {
            const bin = Math.floor(amplitude).toString();
            bins.set(bin, (bins.get(bin) || 0) + 1);
          });

          const histogram = Array.from(bins.entries())
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([range, frequency]) => ({ range, frequency }));

          setHistogramData(histogram);
        })
        .catch((err) => {
          setError(err.message || "Failed to fetch sensor data");
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [systemParam, gaugeParam, sensorParam]);

  return (
    <div className="flex-1 bg-black text-white">
      {/* Dropdowns */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-6 max-w-4xl">
          <div className="flex flex-col">
            <label className="text-sm mb-2 font-medium">System</label>
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
            <label className="text-sm mb-2 font-medium">Gauge</label>
            <select
              value={gaugeParam}
              onChange={(e) => setGaugeParam(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-2 text-sm rounded"
            >
              <option value="gauge_1">Gauge 1</option>
              <option value="gauge_2">Gauge 2</option>
              <option value="gauge_3">Gauge 3</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 font-medium">Sensor</label>
            <select
              value={sensorParam}
              onChange={(e) => setSensorParam(e.target.value)}
              className="bg-white border border-gray-400 text-black px-3 py-2 text-sm rounded"
            >
              <option value="sensor_1">Sensor 1</option>
              <option value="sensor_2">Sensor 2</option>
              <option value="sensor_3">Sensor 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="p-4 text-red-500 font-semibold">Error: {error}</div>}

      {/* Graph Header */}
      <div className="bg-gray-600 text-center py-3 border-b border-gray-500">
        <h2 className="font-medium text-lg">Graph</h2>
      </div>

      {/* Charts */}
      <div className="p-4 space-y-6">
        {/* Noise Signal */}
        <div className="bg-gray-800 border border-gray-600 rounded">
          <div className="p-3 border-b border-gray-600 flex justify-between">
            <h3 className="font-medium">Noise Signal</h3>
            <div className="text-sm">
              <span className="mr-4">20</span>
              <span className="mr-16">Amplitude</span>
              <span className="mr-4">0</span>
              <span>-20</span>
            </div>
          </div>
          <div className="p-4 relative h-48 bg-white border border-gray-400 rounded">
            <NoiseChart data={noiseData} />
            <div className="absolute left-2 top-2 text-black text-xs">20</div>
            <div className="absolute left-2 top-1/2 text-black text-xs">0</div>
            <div className="absolute left-2 bottom-2 text-black text-xs">-20</div>
          </div>
          <div className="flex justify-between text-white text-xs mt-2 px-4">
            {[...Array(26)].map((_, i) => (
              <span key={i}>{(i * 0.04).toFixed(2)}</span>
            ))}
          </div>
        </div>

        {/* Histogram */}
        <div className="bg-gray-800 border border-gray-600 rounded">
          <div className="p-3 border-b border-gray-600 flex justify-between">
            <h3 className="font-medium">Histogram of Noise</h3>
            <div className="text-sm">
              <span className="mr-4">3</span>
              <span className="mr-16">Frequency</span>
              <span>0</span>
            </div>
          </div>
          <div className="p-4 relative h-48 bg-white border border-gray-400 rounded">
            <HistogramChart data={histogramData} />
            <div className="absolute left-2 top-2 text-black text-xs">3</div>
            <div className="absolute left-2 top-1/3 text-black text-xs">2</div>
            <div className="absolute left-2 top-2/3 text-black text-xs">1</div>
            <div className="absolute left-2 bottom-2 text-black text-xs">0</div>
          </div>
          <div className="flex justify-between text-white text-xs mt-2 px-4">
            {histogramData.length > 0
              ? histogramData.map((item) => <span key={item.range}>{item.range}</span>)
              : Array.from({ length: 13 }, (_, i) => <span key={i}>{i - 6}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
