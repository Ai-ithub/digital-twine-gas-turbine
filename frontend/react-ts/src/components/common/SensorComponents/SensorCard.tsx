// src\components\common\SensorComponents\SensorCard.tsx
import React from "react";

interface SensorCardProps {
  label: string;
  value: number | undefined;
  unit?: string;
  color?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ label, value, unit, color }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 border-l-4 ${color || "border-blue-500"}`}>
      <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
      <p className="text-xl font-bold">
        {value !== undefined && !isNaN(value) ? value.toFixed(2) : "0.00"} {unit}
      </p>
    </div>
  );
};

export default SensorCard;


