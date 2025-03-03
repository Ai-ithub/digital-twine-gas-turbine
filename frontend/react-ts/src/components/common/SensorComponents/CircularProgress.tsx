import React from "react";

interface AirQualityProps {
  value: number;
  max?: number;
}

const AirQualityCircle: React.FC<AirQualityProps> = ({ value, max = 500 }) => {
  const percentage = (value / max) * 100;
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r="35" stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle
          cx="50%"
          cy="50%"
          r="35"
          stroke={value < 100 ? "#22c55e" : value < 300 ? "#facc15" : "#ef4444"}
          strokeWidth="6"
          fill="none"
          strokeDasharray="220"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-xs text-gray-500">ppm</span>
      </div>
    </div>
  );
};

export default AirQualityCircle;
