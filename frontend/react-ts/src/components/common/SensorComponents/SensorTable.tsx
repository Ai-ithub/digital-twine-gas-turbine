// src\components\common\SensorComponents\SensorTable.tsx
import React from "react";
import { SensorData } from "./types";

interface SensorTableProps {
  data: SensorData[];
}

const SensorTable: React.FC<SensorTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
          <th className="border px-4 py-2">Air Pollution</th>
          <th className="border px-4 py-2">Ambient Temp</th>
          <th className="border px-4 py-2">Efficiency</th>
          <th className="border px-4 py-2">Flow Rate</th>
          <th className="border px-4 py-2">Fuel Quality</th>
          <th className="border px-4 py-2">Humidity</th>
          <th className="border px-4 py-2">Load Factor</th>
          <th className="border px-4 py-2">Maintenance Quality</th>
          <th className="border px-4 py-2">Power Consumption</th>
          <th className="border px-4 py-2">Pressure In</th>
          <th className="border px-4 py-2">Pressure Out</th>
          <th className="border px-4 py-2">Startup Cycles</th>
          <th className="border px-4 py-2">Temperature In</th>
          <th className="border px-4 py-2">Temperature Out</th>
          <th className="border px-4 py-2">Time</th>
          <th className="border px-4 py-2">Vibration</th>
          <th className="border px-4 py-2">ID</th>     
       </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((sensor) => (
              <tr key={sensor.id} className="text-center">
                <td className="border px-4 py-2">{sensor.Air_Pollution}</td>
                <td className="border px-4 py-2">{sensor.Ambient_Temperature}</td>

                <td className="border px-4 py-2">{sensor.Efficiency}</td>

                <td className="border px-4 py-2">{sensor.Flow_Rate}</td>

                <td className="border px-4 py-2">{sensor.Fuel_Quality}</td>
                <td className="border px-4 py-2">{sensor.Humidity}</td>

                <td className="border px-4 py-2">{sensor.Load_Factor}</td>
                <td className="border px-4 py-2">{sensor.Maintenance_Quality}</td>

                <td className="border px-4 py-2">{sensor.Power_Consumption}</td>

                <td className="border px-4 py-2">{sensor.Pressure_In}</td>

                <td className="border px-4 py-2">{sensor.Pressure_Out}</td>

                <td className="border px-4 py-2">{sensor.Startup_Shutdown_Cycles}</td>

                <td className="border px-4 py-2">{sensor.Temperature_In}</td>

                <td className="border px-4 py-2">{sensor.Temperature_Out}</td>

                <td className="border px-4 py-2">
                  {sensor.TimeData.toLocaleString()} {/* نمایش تاریخ به فرمت محلی */}
                </td>
                <td className="border px-4 py-2">{sensor.Vibration}</td>
                <td className="border px-4 py-2">{sensor.id}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={17} className="border px-4 py-2 text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SensorTable;
