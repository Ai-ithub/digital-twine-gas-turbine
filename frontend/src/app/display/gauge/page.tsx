

"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Gauge } from "lucide-react";
import { CircularGauge } from "../../../components/CircularGauge";
import axios from "axios";

export interface SensorData {
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

export default function GaugePage() {
  const colors = [
    "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
    "#8b5cf6", "#14b8a6", "#f97316", "#6366f1",
  ];

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    axios.get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then((res) => setSensorData(res.data))
      .catch(() => console.warn("No latest sensor data available yet"));

    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket.IO connected");
    });

    socket.on("sensor_data", (data: SensorData) => {
      setSensorData(data);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.IO disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!connected) return <div className="text-white p-4">Connecting to WebSocket...</div>;
  if (!sensorData) return <div className="text-white p-4">Loading sensor data...</div>;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Gauge size={28} />
        Real-Time Gauges
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CircularGauge title="Pressure In" value={sensorData.pressure_in} unit="bar" max={10} color={colors[0]} />
        <CircularGauge title="Pressure Out" value={sensorData.pressure_out} unit="bar" max={10} color={colors[1]} />
        <CircularGauge title="Temperature In" value={sensorData.temperature_in} unit="°C" max={100} color={colors[2]} />
        <CircularGauge title="Temperature Out" value={sensorData.temperature_out} unit="°C" max={100} color={colors[3]} />
        <CircularGauge title="Flow Rate" value={sensorData.flow_rate} unit="m³/min" max={200} color={colors[4]} />
        <CircularGauge title="Efficiency" value={sensorData.efficiency} unit="%" max={100} color={colors[5]} />
        <CircularGauge title="Power" value={sensorData.power_consumption} unit="kW" max={500} color={colors[6]} />
        <CircularGauge title="Vibration" value={sensorData.vibration} unit="Hz" max={100} color={colors[7]} />
      </div>
    </div>
  );
}
