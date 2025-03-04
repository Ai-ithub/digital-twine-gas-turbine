import React from "react";

interface FuelQualityGaugeProps {
  quality: number;
}

const getQualityColor = (quality: number) => {
  if (quality < 40) return "text-red-500 border-red-500"; // Poor Quality
  if (quality < 70) return "text-yellow-500 border-yellow-500"; // Medium Quality
  return "text-green-500 border-green-500"; // Good Quality
};

const FuelQualityGauge: React.FC<FuelQualityGaugeProps> = ({ quality }) => {
  const qualityPercentage = Math.min(Math.max(quality, 0), 100);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300 flex flex-col items-center">

      <div className="relative w-32 h-32 flex items-center justify-center">

        <div className={`absolute w-full h-full border-8 rounded-full ${getQualityColor(quality)}`} />
        

        <div className="text-2xl font-bold text-gray-800">
          {qualityPercentage.toFixed(1)}%
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mt-0.5 w-full">
        <span className="text-red-500">Low</span>
        <span className="text-yellow-500 text-center w-full">Medium</span>
        <span className="text-green-500 text-right">Good</span>
      </div>
    </div>
  );
};

export default FuelQualityGauge;

