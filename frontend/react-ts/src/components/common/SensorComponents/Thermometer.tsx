import React from "react";

interface TemperatureGaugeProps {
  temperature: number;
  min?: number;
  max?: number;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({ temperature, min = -10, max = 50 }) => {
  const percentage = ((temperature - min) / (max - min)) * 100;

  return (
    <div className="relative w-12 h-32 bg-gray-300 rounded-full overflow-hidden flex flex-col justify-end">
      <div
        className="bg-red-500 w-full transition-all duration-500"
        style={{ height: `${percentage}%` }}
      />
      <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-800">
        {temperature.toFixed(1)}°C
      </p>
    </div>
  );
};

export default TemperatureGauge;
