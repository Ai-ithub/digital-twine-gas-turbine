import React from "react";

interface PressureBarProps {
  pressure: number;
}

const getPressureColor = (pressure: number) => {
  if (pressure < 30) return "bg-blue-500"; // Low Pressure
  if (pressure < 70) return "bg-green-500"; // Normal Pressure
  return "bg-red-500"; // High Pressure
};

const PressureBar: React.FC<PressureBarProps> = ({ pressure }) => {
  const pressurePercentage = Math.min(Math.max(pressure, 0), 100);

  return (
    <div className="w-full bg-white shadow-md rounded-lg p-4 border border-gray-300">

      {/* Pressure Value Display */}
      <div className="text-center text-xl font-bold text-gray-800 mb-2">
        {pressure.toFixed(2)} PSI
      </div>

      {/* Pressure Gauge */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getPressureColor(pressure)} transition-all duration-500`}
          style={{ width: `${pressurePercentage}%` }}
        />
      </div>

      {/* Pressure Labels */}
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span className="text-blue-500">Low</span>
        <span className="text-green-500">Normal</span>
        <span className="text-red-500">High</span>
      </div>
    </div>
  );
};

export default PressureBar;

