import React from "react";
import { SensorData } from "./types";

interface SensorTableProps {
  data: SensorData[];
}

const SensorTable: React.FC<SensorTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">Timestamp</th>
            <th className="py-2 px-4 border">Pressure In</th>
            <th className="py-2 px-4 border">Temperature In</th>
            <th className="py-2 px-4 border">Flow Rate</th>
            <th className="py-2 px-4 border">Pressure Out</th>
            <th className="py-2 px-4 border">Efficiency</th>
            <th className="py-2 px-4 border">Vibration</th>
            <th className="py-2 px-4 border">Power</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sensor, index) => (
            <tr key={index} className="text-center border-t">
              <td className="py-2 px-4 border">{sensor.TimeData}</td>
              <td className="py-2 px-4 border">{sensor.Pressure_In}</td>
              <td className="py-2 px-4 border">{sensor.Temperature_In}</td>
              <td className="py-2 px-4 border">{sensor.Flow_Rate}</td>
              <td className="py-2 px-4 border">{sensor.Pressure_Out}</td>
              <td className="py-2 px-4 border">{sensor.Efficiency}</td>
              <td className="py-2 px-4 border">{sensor.Vibration}</td>
              <td className="py-2 px-4 border">{sensor.Power_Consumption}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensorTable;
