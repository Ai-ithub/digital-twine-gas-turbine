 
import CompressorHeatMap from "../components/common/CompressorHeatMap";
 
import PageMeta from "../components/common/PageMeta";
   
export default function RiskHeatMap() {
  return (
    <>
      <PageMeta
        title="RiskHeatMap"
        description="This is RiskHeatMap page"
      />
           

      <div className="grid grid-cols-1 gap-2 md:gap-1">
      <CompressorHeatMap />
      </div>
    </>
  );
}

