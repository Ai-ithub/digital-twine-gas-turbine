import React from "react";
import SensorCard from "./SensorCard";
import SensorTable from "./SensorTable";
import { SensorData } from "./types";

const Dashboard: React.FC = () => {
  const sensorData: SensorData[] = [
    {
      TimeData: "2024-03-01 14:30:00",
      Pressure_In: 2.5,
      Temperature_In: 100.4,
      Flow_Rate: 15.2,
      Pressure_Out: 1.8,
      Temperature_Out: 90.3,
      Efficiency: 89.5,
      Power_Consumption: 450,
      Vibration: 0.8,
      Frequency: 50,
      Amplitude: 0.2,
      Phase_Angle: 30,
      Mass: 100,
      Stiffness: 5000,
      Damping: 0.3,
      Density: 1.2,
      Velocity: 3.5,
      Viscosity: 0.89,
    },
  ];

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Compressor Sensor Dashboard</h2>

      {/* Key Sensor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SensorCard label="Efficiency" value={sensorData[0].Efficiency} unit="%" color="border-green-500" />
        <SensorCard label="Power Consumption" value={sensorData[0].Power_Consumption} unit="W" color="border-red-500" />
        <SensorCard label="Vibration" value={sensorData[0].Vibration} unit="g" color="border-yellow-500" />
      </div>

      {/* Sensor Data Table */}
      <h3 className="text-xl font-semibold mb-4">Sensor Data History</h3>
      <SensorTable data={sensorData} />
    </div>
  );
};

export default Dashboard;
