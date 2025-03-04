import React from "react";

interface VibrationProps {
  level: number;
}

const VibrationWave: React.FC<VibrationProps> = ({ level }) => {
  return (
    <div className="relative w-24 h-6 flex items-center justify-center">
      <div className="absolute w-full h-full flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-3 bg-blue-500 rounded-full animate-pulse"
            style={{ height: `${(Math.sin(level / 10 + i) + 1) * 8}px` }}
          />
        ))}
      </div>
      <p className="absolute -bottom-6 text-xs text-gray-600">{level.toFixed(2)} Hz</p>
    </div>
  );
};

export default VibrationWave;
