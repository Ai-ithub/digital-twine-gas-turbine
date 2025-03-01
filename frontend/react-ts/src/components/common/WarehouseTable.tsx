import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"; // آیکون‌های مرتب‌سازی

interface InventoryItem {
  name: string;
  category: string;
  stock: number;
  location: string;
}

interface WarehouseTableProps {
  inventory: InventoryItem[];
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState(""); // جستجو
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null); // مرتب‌سازی

  // فیلتر کردن لیست بر اساس جستجو
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // مرتب‌سازی لیست بر اساس تعداد موجودی
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortOrder === "asc") return a.stock - b.stock;
    if (sortOrder === "desc") return b.stock - a.stock;
    return 0;
  });

  // تغییر وضعیت مرتب‌سازی
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="overflow-x-auto">
      {/* 🟢 بخش جستجو */}
      <input
        type="text"
        placeholder="🔍Search in stock..."
        className="mb-4 p-2 border rounded w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">Part Name</th>
            <th className="py-2 px-4 border">Category</th>
            <th className="py-2 px-4 border cursor-pointer" onClick={toggleSortOrder}>
              Stock
              <span className="inline-block ml-2">
                {sortOrder === "asc" ? <FaSortUp /> : sortOrder === "desc" ? <FaSortDown /> : <FaSort />}
              </span>
            </th>
            <th className="py-2 px-4 border">Location</th>
          </tr>
        </thead>
        <tbody>
          {sortedInventory.length > 0 ? (
            sortedInventory.map((item, index) => (
              <tr key={index} className="text-center border-t">
                <td className="py-2 px-4 border">{item.name}</td>
                <td className="py-2 px-4 border">{item.category}</td>
                <td className="py-2 px-4 border">{item.stock}</td>
                <td className="py-2 px-4 border">{item.location}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                ❌   NOT FOUNDED
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseTable;
