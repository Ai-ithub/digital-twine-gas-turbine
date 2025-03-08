import React, { useState, useEffect } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { FaExclamationTriangle } from "react-icons/fa";

interface HeatMapData {
  id: string;
  data: { x: string; y: number }[];
}

const CompressorHeatMap: React.FC = () => {
  const [data, setData] = useState<HeatMapData[]>([]);
  const [alldata, setAllData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // تبدیل داده‌ها به فرمت HeatMapData
  const transformToHeatMapData = (alldata: any[]): HeatMapData[] => {
    if (alldata.length === 0) return [];

    const latestData = alldata.slice(-20); // گرفتن 20 داده آخر
    const extractSubstring = (str: string): string => {
      return str.slice(17, 25); // از موقعیت 17 تا 25 زمان رو بگیر
    };

    const keys = Object.keys(latestData[0]).filter(
      (key) => key !== "id" && key !== "TimeData"
    );

    return keys.map((key) => ({
      id: key,
      data: latestData.map((item) => ({
        x: extractSubstring(item.TimeData), // تبدیل زمان به ساعت
        y: item[key], // مقدار ویژگی
      })),
    }));
  };

  // فراخوانی داده‌ها از API
  const fetchData = async () => {
    try {
      const response = await fetch("http://192.168.37.122:5000/get_all_data");
      if (!response.ok) {
        throw new Error("❌ مشکل در دریافت داده");
      }
      const result = await response.json();
      setAllData(result);
    } catch (error) {
      setError("❌ مشکل در دریافت داده");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // درخواست داده‌ها هر ۵ ثانیه
    return () => clearInterval(interval); // پاک کردن interval در هنگام غیر فعال شدن کامپوننت
  }, []);

  // پردازش داده‌ها هنگام دریافت جدید
  useEffect(() => {
    if (alldata.length > 0) {
      const formattedData = transformToHeatMapData(alldata);
      setData(formattedData);
    }
  }, [alldata]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 text-red-600">
        <FaExclamationTriangle className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Compressor Risk Heat Map</h2>

      <div className="h-120 w-full">
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 90, right: 30, bottom: 60, left: 90 }}
          valueFormat=">-.2f"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "",
            legendPosition: "middle",
            legendOffset: -40
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "",
            legendPosition: "middle",
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendPosition: "middle",
            legendOffset: -70
          }}
          colors={{ type: "sequential", scheme: "red_yellow_green" }}
          emptyColor="#ffffff"
          borderColor="#ffffff"
          borderWidth={1}
          enableLabels={true}
          labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          
          theme={{
            tooltip: { container: { background: "white", fontSize: 12 } },
            labels: { text: { fontSize: 11, fill: "#333333" } },
            axis: { legend: { text: { fontSize: 12, fill: "#333333" } } },
          }}
        />
      </div>
    </div>
  );
};

export default CompressorHeatMap;
