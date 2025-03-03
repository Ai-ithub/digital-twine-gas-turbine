import React from "react";
import ProgressBar from "./ProgressBar";
import WarehouseTable from "./WarehouseTable";

const Dashboard: React.FC = () => {
  const progressData = [
    { task: "Air Filter", progress: 60 },
    { task: "Oil Change", progress: 80 },
    { task: "Coolant Check", progress: 45 },
  ];

  const inventoryData = [
    { name: "Air Filter", category: "Spare Part", stock: 10, location: "A1" },
    { name: "Oil Filter", category: "Spare Part", stock: 5, location: "B2" },
    { name: "Coolant", category: "Liquid", stock: 12, location: "C3" },
    { name: "Compressor", category: "Machinery", stock: 3, location: "D4" },
  ];

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Task Progress</h2>
      {progressData.map((item, index) => (
        <ProgressBar key={index} task={item.task} progress={item.progress} />
      ))}

      <h2 className="text-xl font-bold mt-6 mb-4">Warehouse Inventory</h2>
      <WarehouseTable inventory={inventoryData} />
    </div>
  );
};

export default Dashboard;
