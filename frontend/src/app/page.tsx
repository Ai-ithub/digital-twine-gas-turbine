"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { StatusIndicator } from "../components/Status_indicator";
import { CircularGauge } from "../components/CircularGauge";
import { TemperatureBar } from "../components/Temprature_bar";
import { RealtimeChart } from "../components/RealTime_chart";
import axios from "axios";
import "./global.css";

const API_BASE_URL = "http://localhost:5000";

interface SensorData {
  pressure_in?: number;
  temperature_in?: number;
  vibration?: number;
  flow_rate?: number;
  efficiency?: number;
  power_consumption?: number;
}

export default function HomePage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial data once with axios
    axios.get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then((res) => {
        setSensorData(res.data);
        setError(null);
      })
      .catch((err) => {
        console.warn("No latest sensor data available yet or error fetching:", err.message);
        setError("Failed to fetch initial sensor data");
      });

    // Then connect with Socket.IO for real-time updates
    const socket: Socket = io(API_BASE_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
      console.log("Socket.IO connected, id:", socket.id);
    });

    socket.on("sensor_data", (data: SensorData) => {
      console.log("Received sensor_data:", data);
      setSensorData(data);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      setError("Connection error: " + err.message);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
      console.log("Socket.IO disconnected (cleanup) from HomePage");
    };
  }, []);

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-black">
        <h2>Error connecting to backend:</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!sensorData || !connected) {
    return <div className="text-white p-4 bg-black">Loading sensor data...</div>;
  }

  const formattedData = {
    pressure: sensorData.pressure_in ?? 0,
    temperature: sensorData.temperature_in ?? 0,
    vibration: sensorData.vibration ?? 0,
    flow: sensorData.flow_rate ?? 0,
    efficiency: (sensorData.efficiency ?? 0) * 100,
    power: sensorData.power_consumption ?? 0,
  };

  const systemStatus = {
    overall: "operational",
    compressor: "running",
    cooling: "normal",
    lubrication: "optimal",
  };

  return (
    <div className="p-6 space-y-6 bg-black">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
        <p className="text-gray-400">Real-time monitoring of SGT-400 compressor system</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusIndicator title="System Status" status={systemStatus.overall} value="Operational" />
        <StatusIndicator title="Compressor" status={systemStatus.compressor} value="Running" />
        <StatusIndicator title="Cooling System" status={systemStatus.cooling} value="Normal" />
        <StatusIndicator title="Lubrication" status={systemStatus.lubrication} value="Optimal" />
      </div>

      {/* Main Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Pressure</h3>
          <CircularGauge value={formattedData.pressure} max={100} unit="bar" color="#10b981" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Temperature</h3>
          <CircularGauge value={formattedData.temperature} max={100} unit="°C" color="#f59e0b" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Efficiency</h3>
          <CircularGauge value={formattedData.efficiency} max={100} unit="%" color="#3b82f6" />
        </div>
      </div>

      {/* Temperature Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Temperature Distribution</h3>
          <div className="space-y-4">
            <TemperatureBar label="Inlet" value={45} max={100} />
            <TemperatureBar label="Stage 1" value={formattedData.temperature} max={100} />
            <TemperatureBar label="Stage 2" value={formattedData.temperature + 10} max={100} />
            <TemperatureBar label="Outlet" value={formattedData.temperature + 15} max={100} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Flow Rate</span>
              <span className="text-white font-mono">{formattedData.flow.toFixed(0)} m³/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Power Consumption</span>
              <span className="text-white font-mono">{formattedData.power.toFixed(0)} kW</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Vibration Level</span>
              <span className="text-white font-mono">{formattedData.vibration.toFixed(1)} mm/s</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-gray-300">Operating Hours</span>
              <span className="text-white font-mono">8,247 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Real-time Trends</h3>
        <RealtimeChart />
      </div>
    </div>
  );
}
