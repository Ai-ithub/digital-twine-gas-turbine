import React from "react";
import { BoltIcon } from "@heroicons/react/24/solid";

const PowerIndicator: React.FC<{ power: number }> = ({ power }) => {
  return (
    <div className="flex items-center space-x-2 bg-yellow-100 p-3 rounded-lg shadow-md">
      <BoltIcon className="w-6 h-6 text-yellow-500" />
      <p className="text-lg font-semibold text-gray-700">{power.toFixed(1)} kW</p>
    </div>
  );
};

export default PowerIndicator;

