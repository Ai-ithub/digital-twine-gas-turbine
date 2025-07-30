// src/components/RealtimeSensorData.tsx
"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SensorData {
  pressure_in: number;
  pressure_out: number;
  temperature_in: number;
  temperature_out: number;
  flow_rate: number;
  efficiency: number;
  power_consumption: number;
  vibration: number;
  // add more fields as needed
}

export default function RealtimeSensorData() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Socket.IO connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setConnected(false);
    });

    socket.on("sensor_data", (data: SensorData) => {
      console.log("Received sensor data:", data);
      setSensorData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!connected) return <div>Connecting to WebSocket...</div>;
  if (!sensorData) return <div>Waiting for sensor data...</div>;

  return (
    <div style={{ padding: 20, backgroundColor: "#222", color: "#fff" }}>
      <h2>Real-Time Sensor Data</h2>
      <p>Pressure In: {sensorData.pressure_in} bar</p>
      <p>Pressure Out: {sensorData.pressure_out} bar</p>
      <p>Temperature In: {sensorData.temperature_in} °C</p>
      <p>Temperature Out: {sensorData.temperature_out} °C</p>
      <p>Flow Rate: {sensorData.flow_rate} m³/min</p>
      <p>Efficiency: {sensorData.efficiency} %</p>
      <p>Power Consumption: {sensorData.power_consumption} kW</p>
      <p>Vibration: {sensorData.vibration} Hz</p>
    </div>
  );
}
