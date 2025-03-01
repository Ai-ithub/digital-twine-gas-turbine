 
import PageMeta from "../components/common/PageMeta";
import GanttChart from "../components/common/GanttChart";
import AirCompressorPerformanceMetrics from "../components/common/AirCompressorPerformanceMetrics";
import CompressorHeatMap from "../components/common/CompressorHeatMap";



export default function Analytic() {
  return (
    <>
      <PageMeta
        title="Analytic"
        description="This is Analytic page"
      />
      <div className= "mb-4">
        <GanttChart />
      </div>

      <div className= "mb-4">
      <CompressorHeatMap />
      </div>
      
      <div className= "mb-4">
      <AirCompressorPerformanceMetrics />
      </div>


    </>
  );
}
