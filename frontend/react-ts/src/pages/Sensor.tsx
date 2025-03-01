 
import PageMeta from "../components/common/PageMeta";
import DashboardOfSensors from "../components/common/SensorComponents/DashboardOfSensor"

export default function Sensor() {
  return (
    <>
      <PageMeta
        title="sensor"
        description="This is sensor page"
      />

      <DashboardOfSensors />

    </>
  );
}
