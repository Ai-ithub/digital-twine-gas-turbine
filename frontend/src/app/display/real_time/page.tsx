"use client";

import React, { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import axios from "axios";

import { HistogramChart } from "../../../components/Histogram_chart";
import { NoiseChart } from "../../../components/Noise_chart";

interface SensorData {
  id: number;
  timestamp: string;
  pressure_in: number;
  temperature_in: number;
  flow_rate: number;
  pressure_out: number;
  temperature_out: number;
  efficiency: number;
  power_consumption: number;
  vibration: number;
  status: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function RealtimePage() {
  /* ------------ state ------------- */
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  // rolling buffers of noise and histogram data states
  const [noiseData, setNoiseData] = useState<{ time: string; amplitude: number }[]>([]);
  const [histogramData, setHistogramData] = useState<{ range: string; frequency: number }[]>([]);

  /* ------------ real-time pipe (fetch once + socket) ------------- */
  useEffect(() => {
    // 1. grab the most-recent snapshot
    axios
      .get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then((res) => setSensorData(res.data))
      .catch(() => console.warn("No latest sensor data available yet"));

    // 2. open socket for streaming updates
    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket.IO connected");
    });

    socket.on("sensor_data", (data: SensorData) => {
      setSensorData(data); // update latest sensor data
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.IO disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ------------ update noiseData and histogramData when sensorData changes ------------- */
  useEffect(() => {
    if (!sensorData) return; // skip if no data yet

    const noisePoint = {
      time: sensorData.timestamp,
      amplitude: sensorData.vibration ?? 0,
    };

    setNoiseData((prev) => {
      const updated = [...prev, noisePoint];
      if (updated.length > 100) updated.shift(); // keep last 100 points
      return updated;
    });

    setHistogramData((prev) => {
      const bins = new Map(prev.map(({ range, frequency }) => [range, frequency]));
      const bin = Math.floor(noisePoint.amplitude).toString();
      bins.set(bin, (bins.get(bin) || 0) + 1);

      return Array.from(bins.entries())
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([range, frequency]) => ({ range, frequency }));
    });
  }, [sensorData]);

  /* ------------ UI rendering ------------- */
  if (!connected) return <div className="text-white p-4">Connecting to WebSocket...</div>;
  if (!sensorData) return <div className="text-white p-4">Loading sensor data...</div>;

  return (
    <div className="flex-1 bg-black text-white">
      {/* Header */}
      <div className="bg-gray-600 text-center py-3 border-b border-gray-500">
        <h2 className="font-medium text-lg">Graph</h2>
      </div>

      {/* Noise Signal Chart */}
      <div className="p-4 space-y-6 bg-gray-800 border border-gray-600 rounded mb-6">
        <div className="p-3 border-b border-gray-600">
          <h3 className="font-medium">Noise Signal (vibration)</h3>
        </div>
        <div className="p-4 relative h-48 bg-white border border-gray-400 rounded">
          <NoiseChart data={noiseData} />
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="p-4 space-y-6 bg-gray-800 border border-gray-600 rounded">
        <div className="p-3 border-b border-gray-600">
          <h3 className="font-medium">Histogram of Noise</h3>
        </div>
        <div className="p-4 relative h-48 bg-white border border-gray-400 rounded">
          <HistogramChart data={histogramData} />
        </div>
      </div>
    </div>
  );
}
