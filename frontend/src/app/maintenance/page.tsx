"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000";

interface SensorData {
  id: number;
  [key: string]: number | string | undefined;
}

interface Thresholds {
  threshold1: number;
  threshold2: number;
  threshold3: number;
  threshold4: number;
}

export default function MaintenancePage() {
  const [realTimeData, setRealTimeData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [availableSensorIds, setAvailableSensorIds] = useState<number[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [selectedParameter, setSelectedParameter] = useState("pressure_in");
  const [thresholds, setThresholds] = useState<Thresholds>({
    threshold1: 5,
    threshold2: 7,
    threshold3: 8,
    threshold4: 9,
  });
  const [isRunning, setIsRunning] = useState(false);

  const sensorParameters = [
    "pressure_in", "temperature_in", "flow_rate", "pressure_out", "temperature_out",
    "efficiency", "power_consumption", "vibration", "status", "frequency", "amplitude",
    "phase_angle", "mass", "stiffness", "damping", "density", "velocity", "viscosity"
  ];

  // Socket connection
  useEffect(() => {
    const socket: Socket = io(API_BASE_URL);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to socket");
    });

    socket.on("sensor_data", (data: SensorData) => {
      setRealTimeData(data);
      if (data?.id && !availableSensorIds.includes(data.id)) {
        setAvailableSensorIds((prev) => [...prev, data.id]);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [availableSensorIds]);

  // Optional: Fetch thresholds from backend on load
  /*
  useEffect(() => {
    fetch(`${API_BASE_URL}/thresholds`)
      .then(res => res.json())
      .then(data => setThresholds(data))
      .catch(err => console.error("Failed to fetch thresholds", err));
  }, []);
  */

  const handleRun = () => {
    if (!isRunning) {
      setIsRunning(true);
      setTimeout(() => setIsRunning(false), 3000);
    }
  };

  const selectedSensorData =
    selectedSensorId === realTimeData?.id ? realTimeData : null;

  return (
    <div className="flex-1 bg-black text-white p-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Controls */}
        <div className="space-y-8">
          {/* Thresholds */}
          <div className="flex justify-center gap-10">
            {Object.entries(thresholds).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-sm text-gray-300 mb-2">{key.replace("threshold", "T")}</span>
                <div className="relative h-36 w-8 bg-gray-700 rounded border border-gray-600 flex flex-col justify-end">
                  <div
                    className="bg-green-500 w-full rounded-b"
                    style={{ height: `${(value / 10) * 100}%` }}
                  />
                </div>
                <span className="mt-2 text-xs text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Sensor & Parameter Select */}
          <div className="flex justify-center gap-6">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Sensor ID</label>
              <select
                value={selectedSensorId ?? ""}
                onChange={(e) => setSelectedSensorId(Number(e.target.value))}
                className="w-44 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm rounded"
              >
                <option value="" disabled>Select Sensor</option>
                {availableSensorIds.map((id) => (
                  <option key={id} value={id}>Sensor {id}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Parameter</label>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="w-44 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm rounded"
              >
                {sensorParameters.map((param) => (
                  <option key={param} value={param}>{param}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Value */}
          <div className="text-center text-green-400 mt-4">
            {selectedSensorData ? (
              <p>
                Value:{" "}
                {selectedSensorData[selectedParameter as keyof SensorData] ?? "N/A"}
              </p>
            ) : (
              <p className="text-gray-500">Select a sensor to see live value</p>
            )}
          </div>
        </div>

        {/* Right - Run Button & Indicators */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Run Button */}
          <div className="text-center">
            <div className="bg-gray-600 px-16 py-3 text-white font-bold text-xl border-t border-l border-r border-gray-500 rounded-t">
              RUN
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-16 py-6 font-bold text-xl border-b border-l border-r border-gray-500 transition-all rounded-b ${
                isRunning
                  ? "bg-yellow-600 text-white animate-pulse"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isRunning ? "Running..." : "START"}
            </button>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 transition-colors ${
                  isRunning && i < 6
                    ? "bg-white border-gray-300"
                    : "bg-gray-800 border-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
