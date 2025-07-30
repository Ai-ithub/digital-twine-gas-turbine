"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Settings, Power, Play, Pause, Square } from "lucide-react";

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

export default function ControlPage() {
  const [realTimeData, setRealTimeData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [controlMode, setControlMode] = useState("auto");
  const [systemState, setSystemState] = useState("running");
  const [parameters, setParameters] = useState({
    targetPressure: 85,
    targetTemperature: 75,
    flowRate: 450,
    speed: 3600,
  });

  useEffect(() => {
    // Fetch initial latest data
    axios.get<SensorData>(`${API_BASE_URL}/sensor-data/latest`)
      .then(res => setRealTimeData(res.data))
      .catch(() => console.warn("No latest sensor data available yet"));

    // Setup socket connection (no forced transports)
    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket.IO connected, id:", socket.id);
    });

    socket.on("sensor_data", (data: SensorData) => {
      setRealTimeData(data);
      //console.log("Received sensor_data:", data);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("Socket.IO disconnected, reason:", reason);
    });

    socket.on("connect_error", (error) => {
      setConnected(false);
      console.error("Socket.IO connect error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleParameterChange = (param: string, value: number) => {
    setParameters(prev => ({ ...prev, [param]: value }));
  };

  const handleSystemControl = (action: string) => {
    setSystemState(action);
  };

  // Early UI for connection status and data load
  if (!connected) return <div className="text-white p-4">Connecting to WebSocket...</div>;
  if (!realTimeData) return <div className="text-white p-4">Loading sensor data...</div>;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">System Control</h1>
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              systemState === "running"
                ? "bg-green-600"
                : systemState === "stopped"
                ? "bg-red-600"
                : "bg-yellow-600"
            }`}
          >
            Status: {systemState.charAt(0).toUpperCase() + systemState.slice(1)}
          </div>
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              controlMode === "auto" ? "bg-blue-600" : "bg-purple-600"
            }`}
          >
            Mode: {controlMode.charAt(0).toUpperCase() + controlMode.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" /> Control Panel
          </h2>

          {/* Control Mode */}
          <div>
            <label className="block mb-2">Control Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setControlMode("auto")}
                className={`px-4 py-2 rounded-lg ${
                  controlMode === "auto" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Automatic
              </button>
              <button
                onClick={() => setControlMode("manual")}
                className={`px-4 py-2 rounded-lg ${
                  controlMode === "manual" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Manual
              </button>
            </div>
          </div>

          {/* System Controls */}
          <div>
            <label className="block mb-2">System Controls</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSystemControl("running")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              >
                <Play className="h-4 w-4" /> Start
              </button>
              <button
                onClick={() => handleSystemControl("paused")}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button
                onClick={() => handleSystemControl("stopped")}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
              >
                <Square className="h-4 w-4" /> Stop
              </button>
            </div>
          </div>

          {/* Emergency Stop */}
          <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-white">
              <Power className="h-5 w-5" /> EMERGENCY STOP
            </button>
          </div>
        </div>

        {/* Parameter Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-6">
          <h2 className="text-lg font-semibold">Parameter Settings</h2>

          {["targetPressure", "targetTemperature", "flowRate", "speed"].map(param => {
            const labels: Record<string, string> = {
              targetPressure: `Target Pressure: ${parameters.targetPressure} bar`,
              targetTemperature: `Target Temperature: ${parameters.targetTemperature}°C`,
              flowRate: `Flow Rate: ${parameters.flowRate} m³/h`,
              speed: `Speed: ${parameters.speed} RPM`,
            };
            const minMax: Record<string, [number, number]> = {
              targetPressure: [50, 120],
              targetTemperature: [40, 100],
              flowRate: [200, 800],
              speed: [1000, 5000],
            };
            return (
              <div key={param}>
                <label className="block mb-2">{labels[param]}</label>
                <input
                  type="range"
                  min={minMax[param][0]}
                  max={minMax[param][1]}
                  value={parameters[param as keyof typeof parameters]}
                  onChange={e => handleParameterChange(param, Number(e.target.value))}
                  className="w-full"
                  disabled={controlMode === "auto"}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{minMax[param][0]}</span>
                  <span>{minMax[param][1]}</span>
                </div>
              </div>
            );
          })}

          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
            Apply Settings
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Current Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-700 rounded">
            <div className="text-gray-400 text-sm">Current Pressure</div>
            <div className="text-white text-xl font-bold">{realTimeData.pressure_in.toFixed(1)} bar</div>
          </div>
          <div className="p-3 bg-gray-700 rounded">
            <div className="text-gray-400 text-sm">Current Temperature</div>
            <div className="text-white text-xl font-bold">{realTimeData.temperature_in.toFixed(1)}°C</div>
          </div>
          <div className="p-3 bg-gray-700 rounded">
            <div className="text-gray-400 text-sm">Current Flow</div>
            <div className="text-white text-xl font-bold">{realTimeData.flow_rate.toFixed(0)} m³/h</div>
          </div>
          <div className="p-3 bg-gray-700 rounded">
            <div className="text-gray-400 text-sm">Current Power</div>
            <div className="text-white text-xl font-bold">{realTimeData.power_consumption.toFixed(0)} kW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
