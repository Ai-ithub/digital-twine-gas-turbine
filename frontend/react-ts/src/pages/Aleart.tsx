import React, { useEffect, useState } from "react";
import { SensorData } from "../components/common/SensorComponents/types";


// تابع برای چک کردن وضعیت هشدار هر داده
const getAlertStatus = (value: number, threshold: number): string => {
  if (value > threshold) {
    return "Danger"; // اگر مقدار بیشتر از آستانه بود، وضعیت "خطر"
  } else if (value > threshold * 0.8) {
    return "Warning"; // اگر مقدار بین 80% و 100% آستانه باشد، وضعیت "هشدار"
  } else {
    return "Safe"; // در غیر این صورت وضعیت "خوب"
  }
};

const Alert: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://192.168.37.122:5000/get_all_data");
      if (!response.ok) throw new Error("Failed to fetch data");

      let data = await response.json();
      console.log("Raw Data from API:", data);

      const parsedData: SensorData[] = data.map((item: any) => ({
        Air_Pollution: item.Air_Pollution ?? 0,
        Ambient_Temperature: item.Ambient_Temperature ?? 0,
        Efficiency: item.Efficiency ?? 0,
        Flow_Rate: item.Flow_Rate ?? 0,
        Fuel_Quality: item.Fuel_Quality ?? 0,
        Humidity: item.Humidity ?? 0,
        Load_Factor: item.Load_Factor ?? 0,
        Maintenance_Quality: item.Maintenance_Quality ?? 0,
        Power_Consumption: item.Power_Consumption ?? 0,
        Pressure_In: item.Pressure_In ?? 0,
        Pressure_Out: item.Pressure_Out ?? 0,
        Temperature_In: item.Temperature_In ?? 0,
        Temperature_Out: item.Temperature_Out ?? 0,
        Vibration: item.Vibration ?? 0,
        id: item.id ?? 0, // این خط حذف می‌شود
        TimeData: item.TimeData, // این خط حذف می‌شود
        Startup_Shutdown_Cycles: item.Startup_Shutdown_Cycles ?? 0, // این خط حذف می‌شود
      }));

      setSensorData(parsedData);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching sensor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const fetchInterval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    if (sensorData.length === 0) return;
    const switchInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sensorData.length);
    }, 1000);
    return () => clearInterval(switchInterval);
  }, [sensorData]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-red-500 text-center text-lg">{error}</p>;

  const currentSensor = sensorData[currentIndex];

  const getAlertStatus = (value: number, type: string): string => {
    switch (type) {
      case "Air_Pollution":
        if (value > 0.07) return "Danger";
        if (value > 0.05) return "Warning";
        return "Safe";
      case "Ambient_Temperature":
        if (value > 30) return "Danger";
        if (value > 25) return "Warning";
        return "Safe";
      case "Efficiency":
        if (value < 0.75) return "Danger";
        if (value < 0.85) return "Warning";
        return "Safe";
      case "Flow_Rate":
        if (value < 8) return "Danger";
        if (value < 10) return "Warning";
        return "Safe";
      case "Fuel_Quality":
        if (value < 90) return "Danger";
        if (value < 95) return "Warning";
        return "Safe";
      case "Humidity":
        if (value < 30 || value > 70) return "Danger";
        if (value < 40 || value > 60) return "Warning";
        return "Safe";
      case "Load_Factor":
        if (value < 0.6) return "Danger";
        if (value < 0.8) return "Warning";
        return "Safe";
      case "Maintenance_Quality":
        if (value < 60) return "Danger";
        if (value < 80) return "Warning";
        return "Safe";
      case "Power_Consumption":
        if (value > 250) return "Danger";
        if (value > 200) return "Warning";
        return "Safe";
      case "Pressure_In":
        if (value < 2.5 || value > 5) return "Danger";
        if (value < 3 || value > 4) return "Warning";
        return "Safe";
      case "Pressure_Out":
        if (value < 2.5 || value > 5) return "Danger";
        if (value < 3 || value > 4) return "Warning";
        return "Safe";
      case "Temperature_In":
        if (value > 30) return "Danger";
        if (value > 25) return "Warning";
        return "Safe";
      case "Temperature_Out":
        if (value > 40) return "Danger";
        if (value > 35) return "Warning";
        return "Safe";
      case "Vibration":
        if (value > 1.2) return "Danger";
        if (value > 1) return "Warning";
        return "Safe";
      default:
        return "Safe";
    }
  };
  

  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
=======
    <>
      <PageMeta
        title="Aleart"
        description="This is aleart page"
      />
  
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="border col-span-12 space-y-6 xl:col-span-7">
        <DataInserter/>
        </div>
>>>>>>> main

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
      Compressor Snsors Warnings
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.keys(currentSensor).map((key) => {
          const typedKey = key as keyof SensorData;
          const value = currentSensor[typedKey];
          const status = getAlertStatus(value, 100); // 100 می‌تواند آستانه هشدار باشد


          if (typedKey === "id" || typedKey === "TimeData" || typedKey === "Startup_Shutdown_Cycles") {
            return null;
          }

          return (
<SensorCard
  key={typedKey}
  title={typedKey}
  value={value}
  status={getAlertStatus(value, typedKey)}
/>

          );
        })}
      </div>
    </div>
  );
};

// Reusable Card Component for Sensor Widgets
const SensorCard: React.FC<{ title: string; value: number; status: string }> = ({ title, value, status }) => {
  let statusColor = "bg-green-500"; // Default to good (green)
  let borderColor = "border-green-700";

  if (status === "Warning") {
    statusColor = "bg-yellow-400";
    borderColor = "border-yellow-600";
  } else if (status === "Danger") {
    statusColor = "bg-red-600"; // Strong red for danger
    borderColor = "border-red-700"; // Darker red for border
  }

  return (
    <div className={`bg-white shadow-md rounded-lg p-6 flex flex-col items-center border ${borderColor}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className={`${statusColor} text-center p-4 rounded-lg w-full`}>
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className={`text-center text-white font-bold`}>
          {status === "Danger" ? "Danger" : status === "Warning" ? "Warning" : "Safe"}
        </p>
      </div>
    </div>
  );
};


export default Alert;
