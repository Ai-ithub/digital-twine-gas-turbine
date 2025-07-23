"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store"; // Adjust the path if needed
import { connectWebSocket, disconnectWebSocket } from "../../../lib/websocket";

// You can replace these with your actual imported components
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

export default function GaugePage() {
  const dispatch = useDispatch<AppDispatch>();
  const realTimeData = useSelector((state: RootState) => state.sensor.latest);

  useEffect(() => {
    connectWebSocket(dispatch);
    return () => {
      disconnectWebSocket();
    };
  }, [dispatch]);

  if (!realTimeData) return <div className="text-white p-4">Loading sensor data...</div>;

  return (
    <div className="flex-1 bg-black text-white p-4 min-h-screen">
      {/* Top Gauges */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="Frequency" value={realTimeData.frequency ?? 0} max={100} />
        <CircularGauge title="Absolute Pressure" value={realTimeData.pressure_in ?? 0} max={1000} unit="psi" />
        <CircularGauge title="Static Pressure" value={realTimeData.pressure_out ?? 0} max={1000} unit="psi_s" />
        <CircularGauge title="Dynamic Pressure" value={realTimeData.flow_rate ?? 0} max={1000} unit="psi_d" />
        <div className="bg-black p-4 rounded">
          <h3 className="text-white text-sm font-medium mb-4 text-center">Pressure</h3>
          <div className="flex gap-4 justify-center">
            <VerticalBar title="P_C" value={realTimeData.pressure_in ?? 0} max={100} />
            <VerticalBar title="P_T" value={realTimeData.pressure_out ?? 0} max={100} />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="Amplitude" value={realTimeData.vibration ?? 0} max={800} />
        <CircularGauge title="Power" value={realTimeData.power_consumption ?? 0} max={2000} />
        <CircularGauge title="Efficiency" value={realTimeData.efficiency ?? 0} max={100} unit="%" />
        <CircularGauge title="Flow Rate" value={realTimeData.flow_rate ?? 0} max={1000} />
        {/* <div className="bg-black p-4 rounded flex justify-center">
          <VerticalBar title="θ" value={realTimeData.angle ?? 0} max={100} />
        </div> */}
      </div>

      {/* TEMP Section
      <div className="bg-gray-800 p-4 rounded mb-8">
        <h2 className="text-white text-lg font-bold mb-4 text-center">TEMP</h2>
        <div className="grid grid-cols-10 gap-2">
          <VerticalBar title="Relative Temp" value={realTimeData.relative_temp ?? 0} max={100} />
          <VerticalBar title="Surface Temp" value={realTimeData.surface_temp ?? 0} max={100} />
          <VerticalBar title="Internal Temp" value={realTimeData.internal_temp ?? 0} max={100} />
          <VerticalBar title="Point Temp" value={realTimeData.point_temp ?? 0} max={100} />
          <VerticalBar title="Fluctuating Temp" value={realTimeData.temp_fluctuation ?? 0} max={100} />
          <VerticalBar title="Freezing Point" value={realTimeData.temp_freezing ?? 0} max={100} />
          <VerticalBar title="Dew Point" value={realTimeData.temp_dew_point ?? 0} max={100} />
          <VerticalBar title="Temp_vis" value={realTimeData.temp_vis ?? 0} max={100} />
          <VerticalBar title="Flash Point" value={realTimeData.flash_point ?? 0} max={100} />
          <VerticalBar title="TBN" value={realTimeData.tbn ?? 0} max={100} />
        </div>
      </div> */}

      {/* Viscosity */}
      <div className="mt-4 text-center">
        <h3 className="text-white text-lg font-medium">Viscosity</h3>
        {/* Add more bars/graphs if needed */}
      </div>
    </div>
  );
}
