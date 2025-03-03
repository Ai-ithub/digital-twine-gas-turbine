// src\components\common\SensorComponents\DashboardOfSensor.tsx
import React, { useEffect, useState } from "react";
import SensorTable from "./SensorTable";
import TemperatureGauge from "./Thermometer";
import AirQualityCircle from "./CircularProgress";
import PressureBar from "./PressureBar";
import PowerIndicator from "./PowerConsumptionIndicator";
import VibrationWave from "./VibrationWave";
import { SensorData } from "./types";
import FuelQualityGauge from "./FuelQualityGauge";

const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const DashboardOfSensors: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get_all_data");
      if (!response.ok) throw new Error("Failed to fetch data");

      let data = await response.json();
      console.log("Raw Data from API:", data);

      const parsedData: SensorData[] = data.data.map((item: any) => ({
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
        Startup_Shutdown_Cycles: item.Startup_Shutdown_Cycles ?? 0,
        Temperature_In: item.Temperature_In ?? 0,
        Temperature_Out: item.Temperature_Out ?? 0,
        TimeData: isValidDate(item.TimeData)
          ? new Date(item.TimeData)
          : new Date(0),
        Vibration: item.Vibration ?? 0,
        id: item.id ?? 0,
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Dashboard Title */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Compressor Sensor Dashboard
      </h2>

      {/* Sensor Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SensorCard title="Temperature" component={<TemperatureGauge temperature={currentSensor.Ambient_Temperature} />} />
        <SensorCard title="Air Quality" component={<AirQualityCircle value={currentSensor.Air_Pollution} />} />
        <SensorCard title="Pressure" component={<PressureBar pressure={currentSensor.Pressure_In} />} />
        <SensorCard title="Power Consumption" component={<PowerIndicator power={currentSensor.Power_Consumption} />} />
        <SensorCard title="Vibration Level" component={<VibrationWave level={currentSensor.Vibration} />} />
        <SensorCard title="Fuel Quality" component={<FuelQualityGauge quality={currentSensor.Fuel_Quality} />} />

      </div>

      {/* Sensor Data Table */}
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          Current Sensor Data
        </h3>
        {sensorData.length > 0 && <SensorTable data={[currentSensor]} />}
      </div>
    </div>
  );
};

// Reusable Card Component for Sensor Widgets
const SensorCard: React.FC<{ title: string; component: React.ReactNode }> = ({ title, component }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center border border-gray-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {component}
    </div>
  );
};

export default DashboardOfSensors;


