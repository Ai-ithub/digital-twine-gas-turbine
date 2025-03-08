// src\pages\Sensor.tsx
import PageMeta from "../components/common/PageMeta";
import DashboardOfSensors from "../components/common/SensorComponents/DashboardOfSensor";

export default function Sensor() {
  return (
    <>
      <PageMeta title="Sensor" description="This is the sensor page" />
      <DashboardOfSensors />
    </>
  );
}



