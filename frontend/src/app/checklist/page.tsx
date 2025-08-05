"use client"
import React from "react"
import { useState } from "react"

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState([
    { id: 1, item: "Pre-startup inspection completed", checked: true, category: "Startup" },
    { id: 2, item: "Oil levels verified", checked: true, category: "Lubrication" },
    { id: 3, item: "Pressure sensors calibrated", checked: false, category: "Sensors" },
    { id: 4, item: "Temperature probes tested", checked: true, category: "Sensors" },
    { id: 5, item: "Vibration monitoring active", checked: false, category: "Monitoring" },
    { id: 6, item: "Emergency shutdown tested", checked: true, category: "Safety" },
    { id: 7, item: "Inlet filters inspected", checked: false, category: "Maintenance" },
    { id: 8, item: "Outlet valves operational", checked: true, category: "Operations" },
    { id: 9, item: "Control system responsive", checked: true, category: "Control" },
    { id: 10, item: "Data logging functional", checked: false, category: "Data" },
  ])

  const toggleCheck = (id: number) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const categories = Array.from(new Set(checklist.map((item) => item.category)));
  const completionRate = Math.round((checklist.filter((item) => item.checked).length / checklist.length) * 100)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">System Checklist</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">Completion: {completionRate}%</div>
          <div className="w-48 bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category} className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{category}</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {checklist
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`text-sm cursor-pointer ${
                          item.checked ? "text-green-400 line-through" : "text-gray-300"
                        }`}
                      >
                        {item.item}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          className={`px-6 py-2 rounded-lg font-medium ${
            completionRate === 100
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
          disabled={completionRate < 100}
        >
          {completionRate === 100 ? "All Checks Complete" : "Complete All Checks"}
        </button>
      </div>
    </div>
  )
}
