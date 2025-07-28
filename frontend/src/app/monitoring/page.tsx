"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Activity, Zap, Thermometer, Gauge } from "lucide-react";
import { IntensityGraph } from "../../components/Intensity_graph";

// Define full shape of sensor data
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

export default function MonitoringPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      message: "Vibration levels within normal range",
      type: "info",
      time: "10:30:15",
    },
    {
      id: 2,
      message: "Temperature spike detected at 10:25",
      type: "warning",
      time: "10:25:32",
    },
    {
      id: 3,
      message: "System operating efficiently",
      type: "success",
      time: "10:20:45",
    },
  ]);

  useEffect(() => {
    // Initial fetch
    axios
      .get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then((res) => setSensorData(res.data))
      .catch(() => console.warn("No latest sensor data available yet"));

    // Socket setup
    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket.IO connected to monitoring page");
    });

    socket.on("sensor_data", (data: SensorData) => {
      setSensorData(data);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.IO disconnected from monitoring page");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!connected) return <div className="text-white p-4">Connecting to WebSocket...</div>;
  if (!sensorData) return <div className="text-white p-4">Loading real-time data...</div>;

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Real-Time Operations</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-green-600 text-white text-sm rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Live Monitoring
          </div>
          <div className="text-gray-400 text-sm">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Metrics and Intensity Graph */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Pressure */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pressure</h3>
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {sensorData.pressure_in?.toFixed(1) ?? "-"} bar
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((sensorData.pressure_in ?? 0) / 120) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Temperature</h3>
              <Thermometer className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              {sensorData.temperature_in?.toFixed(1) ?? "-"}°C
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((sensorData.temperature_in ?? 0) / 100) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Intensity Graph */}
        <div className="w-full lg:w-[420px]">
          <h3 className="text-white text-lg font-semibold mb-2">Intensity Map</h3>
          <IntensityGraph />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Live System Alerts</h2>
        </div>
        <div className="p-4 space-y-3">
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
  );
}
