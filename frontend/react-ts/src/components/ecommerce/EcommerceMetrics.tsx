 
 
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyTarget from "./MonthlyTarget";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4">
      {/* <!-- Metric Item Start --> */}
      <MonthlyTarget />
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <MonthlySalesChart />
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
