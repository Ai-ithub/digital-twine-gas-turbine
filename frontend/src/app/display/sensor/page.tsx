"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

// Gauge UI Components
const CircularGauge = ({
  title,
  value,
  max,
  unit = "",
}: {
  title: string;
  value: number;
  max: number;
  unit?: string;
}) => (
  <div className="bg-gray-900 p-4 rounded text-center">
    <h3 className="text-white text-sm mb-2">{title}</h3>
    <div className="text-2xl font-bold text-white">
      {value} {unit}
    </div>
    <div className="text-xs text-gray-400">Max: {max}</div>
  </div>
);

const VerticalBar = ({
  title,
  value,
  max,
}: {
  title: string;
  value: number;
  max: number;
}) => (
  <div className="flex flex-col items-center justify-end h-48 w-8 bg-gray-800 rounded">
    <div
      className="bg-green-500 w-full rounded-t"
      style={{ height: `${(value / max) * 100}%` }}
    />
    <span className="text-white text-xs mt-1 text-center">{title}</span>
  </div>
);

// Data structure
export interface SensorData {
  frequency: number;
  pressure_in: number;
  pressure_out: number;
  flow_rate: number;
  power_consumption: number;
  efficiency: number;
  vibration: number;
  // Add any new fields here
}

const API_BASE_URL = "http://localhost:5000";

export default function SensorPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initial fetch for fallback
    axios.get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then((res) => setSensorData(res.data))
      .catch(() => console.warn("No latest sensor data available yet"));

    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket.IO connected to SensorPage");
    });

    socket.on("sensor_data", (data: SensorData) => {
      setSensorData(data);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.IO disconnected from SensorPage");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!connected) return <div className="text-white p-4">Connecting to WebSocket...</div>;
  if (!sensorData) return <div className="text-white p-4">Loading sensor data...</div>;

  return (
    <div className="flex-1 bg-black text-white p-4 min-h-screen">
      <h1 className="text-xl font-bold mb-6">Sensor Overview</h1>

      {/* Top Gauges */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="Frequency" value={sensorData.frequency ?? 0} max={100} unit="Hz" />
        <CircularGauge title="Absolute Pressure" value={sensorData.pressure_in ?? 0} max={1000} unit="psi" />
        <CircularGauge title="Static Pressure" value={sensorData.pressure_out ?? 0} max={1000} unit="psi_s" />
        <CircularGauge title="Dynamic Pressure" value={sensorData.flow_rate ?? 0} max={1000} unit="psi_d" />
        <div className="bg-black p-4 rounded">
          <h3 className="text-white text-sm font-medium mb-4 text-center">Pressure</h3>
          <div className="flex gap-4 justify-center">
            <VerticalBar title="P_C" value={sensorData.pressure_in ?? 0} max={100} />
            <VerticalBar title="P_T" value={sensorData.pressure_out ?? 0} max={100} />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="Amplitude" value={sensorData.vibration ?? 0} max={800} unit="Hz" />
        <CircularGauge title="Power" value={sensorData.power_consumption ?? 0} max={2000} unit="kW" />
        <CircularGauge title="Efficiency" value={sensorData.efficiency ?? 0} max={100} unit="%" />
        <CircularGauge title="Flow Rate" value={sensorData.flow_rate ?? 0} max={1000} unit="m³/min" />
      </div>
    </div>
  );
}
