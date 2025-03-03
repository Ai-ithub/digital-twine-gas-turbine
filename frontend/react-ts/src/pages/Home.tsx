  
import PageMeta from "../components/common/PageMeta";
import EcommerceMetrics from "../components/ecommerce/EcommerceMetrics";
  
import StatisticsChart from "../components/ecommerce/StatisticsChart";
 
export default function Home() {
  return (
    <>
      <PageMeta
        title="Home"
        description="This is Home page"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
      <div className="col-span-12 space-y-6 xl:col-span-7">
      <EcommerceMetrics />
 
      
        </div>
 

        <div className="border col-span-12">
        <StatisticsChart />

        </div>
      </div>
    </>
  );
}

