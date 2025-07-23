"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "../../lib/websocket";
import { AppDispatch, RootState } from "../../store";


export default function MaintenancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const realTimeData = useSelector((state: RootState) => state.sensor.latest);

  // Store unique sensor IDs received from websocket
  const [availableSensorIds, setAvailableSensorIds] = useState<number[]>([]);

  // Static list of parameters to select (could be dynamic if needed)
  const sensorParameters = [
    "pressure_in",
    "temperature_in",
    "flow_rate",
    "pressure_out",
    "temperature_out",
    "efficiency",
    "power_consumption",
    "vibration",
    "status",
    "frequency",
    "amplitude",
    "phase_angle",
    "mass",
    "stiffness",
    "damping",
    "density",
    "velocity",
    "viscosity",
  ];

  // Selected dropdown values
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [selectedParameter, setSelectedParameter] = useState(sensorParameters[0]);

  const [thresholds, setThresholds] = useState({
    threshold1: 5,
    threshold2: 7,
    threshold3: 8,
    threshold4: 9,
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Connect websocket
    connectWebSocket(dispatch);
    return () => {
      disconnectWebSocket();
    };
  }, [dispatch]);

  // On every new realTimeData, add its id to availableSensorIds if not present
  useEffect(() => {
    if (!realTimeData) return;
    if (!availableSensorIds.includes(realTimeData.id)) {
      setAvailableSensorIds((prev) => [...prev, realTimeData.id]);
    }
  }, [realTimeData, availableSensorIds]);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  // Get the selected sensor data object from realTimeData if id matches
  // (assuming realTimeData updates with only one sensor data at a time)
  // Or you can adapt your Redux state to hold all sensors if you want multiple at once.
  const selectedSensorData = selectedSensorId === realTimeData?.id ? realTimeData : null;

  return (
    <div className="flex-1 bg-black text-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Controls */}
        <div className="space-y-6">
          {/* Threshold Sliders */}
          <div className="flex justify-center gap-8 mb-8">
            {Object.entries(thresholds).map(([key, value]) => (
              <div key={key} className="text-center">
                <label className="text-white text-sm mb-2 block">
                  {key.replace("threshold", "treshold")}
                </label>
                <div className="relative">
                  <div className="w-6 h-32 bg-gray-700 rounded mx-auto relative border border-gray-500">
                    <div
                      className="absolute bottom-0 w-full bg-green-500 rounded-b"
                      style={{ height: `${(value / 10) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-600 rounded-sm cursor-pointer"
                      style={{ top: `${100 - (value / 10) * 100}%` }}
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dropdown Controls */}
          <div className="flex gap-4 justify-center">
            {/* Sensor ID Dropdown */}
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Sensor ID</label>
              <select
                value={selectedSensorId ?? ""}
                onChange={(e) => setSelectedSensorId(Number(e.target.value))}
                className="w-48 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select Sensor
                </option>
                {availableSensorIds.map((id) => (
                  <option key={id} value={id}>
                    Sensor {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Parameter Dropdown */}
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Parameter</label>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="w-48 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
              >
                {sensorParameters.map((param) => (
                  <option key={param} value={param}>
                    {param}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display selected sensor parameter live */}
          <div className="mt-6 text-center text-green-400">
            {selectedSensorData ? (
              <p>
                Value:{" "}
                {selectedSensorData[selectedParameter as keyof typeof selectedSensorData] ??
                  "N/A"}
              </p>
            ) : (
              <p className="text-gray-500">Select a sensor to see live value</p>
            )}
          </div>
        </div>

        {/* Right Side - Run Button and Status */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Run Button */}
          <div className="text-center">
            <div className="bg-gray-600 px-16 py-3 text-white font-bold text-xl border-t border-l border-r border-gray-500">
              RUN
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-16 py-6 font-bold text-xl border-b border-l border-r border-gray-500 transition-colors ${
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
                className={`w-12 h-12 rounded-full border-2 transition-colors ${
                  isRunning && i < 6
                    ? "bg-white border-gray-300"
                    : "bg-gray-700 border-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
