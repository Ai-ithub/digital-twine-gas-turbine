import React, { useState, useMemo } from "react";
import {
  // LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { FiDownload } from "react-icons/fi";
import { format, subDays, subMonths } from "date-fns";

interface ChartData {
  date: string;
  energyConsumption: number;
  efficiency: number;
  downtime: number;
  maintenance: number;
}

const AirCompressorChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<string>("weekly");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const generateData = (period: string): ChartData[] => {
    const dataPoints = period === "weekly" ? 7 : 30;
    const data: ChartData[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const date =
        period === "weekly"
          ? subDays(new Date(), dataPoints - i - 1)
          : subMonths(new Date(), dataPoints - i - 1);

      data.push({
        date: format(date, "MMM dd, yyyy"),
        energyConsumption: Math.floor(Math.random() * 100) + 50,
        efficiency: Math.floor(Math.random() * 30) + 60,
        downtime: Math.floor(Math.random() * 20),
        maintenance: Math.floor(Math.random() * 40) + 20,
      });
    }
    return data;
  };

  const chartData = useMemo(() => generateData(timeFrame), [timeFrame]);

  const handleExport = () => {
    const svgElement = document.querySelector(".recharts-wrapper svg");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      console.log(ctx);
      console.log(setIsLoading,setError );

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "compressor-performance.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading chart: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Air Compressor Performance Metrics
        </h2>

        <div className="flex items-center space-x-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export PNG
          </button>
        </div>
      </div>

      <div className="h-[600px] w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4B5563" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return isNaN(date.getTime()) ? value : format(date, "MMM dd");
                }}
              />
              <YAxis yAxisId="left" tick={{ fill: "#4B5563" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#4B5563" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="energyConsumption"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                name="Energy Consumption"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                name="Operating Efficiency"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="downtime"
                fill="#EF4444"
                fillOpacity={0.2}
                stroke="#EF4444"
                name="Downtime %"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="maintenance"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="Maintenance Score"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AirCompressorChart;