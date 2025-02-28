import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { FaExpandAlt, FaCompress, FaFilter } from "react-icons/fa";

interface Part {
  id: number;
  partName: string;
  category: string;
  startDate: Date;
  expectedReplacement: Date;
  criticalDate: Date;
  usagePercentage: number;
  riskLevel: "high" | "medium" | "low";
}

const mockData: Part[] = [
  {
    id: 1,
    partName: "Engine Filter",
    category: "Filtration",
    startDate: new Date(2024, 0, 1),
    expectedReplacement: new Date(2024, 5, 15),
    criticalDate: new Date(2024, 6, 1),
    usagePercentage: 75,
    riskLevel: "medium",
  },
  {
    id: 2,
    partName: "Transmission Belt",
    category: "Drive System",
    startDate: new Date(2024, 1, 1),
    expectedReplacement: new Date(2024, 8, 1),
    criticalDate: new Date(2024, 9, 1),
    usagePercentage: 45,
    riskLevel: "low",
  },
  {
    id: 3,
    partName: "Brake Pads",
    category: "Braking System",
    startDate: new Date(2024, 0, 15),
    expectedReplacement: new Date(2024, 4, 1),
    criticalDate: new Date(2024, 4, 15),
    usagePercentage: 90,
    riskLevel: "high",
  },
];

const GanttChart: React.FC = () => {
  const [data, setData] = useState<Part[]>(mockData);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(data.map((item) => item.category))];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  const filteredData = useCallback(() => {
    return selectedCategory === "all"
      ? data
      : data.filter((item) => item.category === selectedCategory);
  }, [data, selectedCategory]);

  const getProgressBarColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  const calculateWidth = (start: Date, end: Date): string => {
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return `${totalDays * zoom}px`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Part Replacement Timeline</h2>
        <div className="flex gap-4">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaExpandAlt />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaCompress />
          </button>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <FaFilter className="absolute right-2 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {filteredData().map((item) => (
            <div key={item.id} className="relative h-16 mb-4 flex items-center">
              <div className="w-48 font-medium text-gray-700">{item.partName}</div>
              <div className="flex-1 relative h-8">
                <div
                  className={`absolute h-full rounded ${getProgressBarColor(item.riskLevel)}`}
                  style={{
                    left: calculateWidth(new Date(2024, 0, 1), item.startDate),
                    width: calculateWidth(item.startDate, item.expectedReplacement),
                  }}
                >
                  <div className="opacity-0 hover:opacity-100 absolute top-[-40px] left-0 bg-gray-900 text-white p-2 rounded text-sm whitespace-nowrap transition-opacity">
                    <p>Part: {item.partName}</p>
                    <p>Usage: {item.usagePercentage}%</p>
                    <p>Replace by: {format(item.expectedReplacement, "MMM dd, yyyy")}</p>
                    <p>Risk Level: {item.riskLevel}</p>
                  </div>
                </div>
                <div
                  className="absolute h-full w-1 bg-red-600"
                  style={{
                    left: calculateWidth(new Date(2024, 0, 1), item.criticalDate),
                  }}
                  title="Critical Replacement Date"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;