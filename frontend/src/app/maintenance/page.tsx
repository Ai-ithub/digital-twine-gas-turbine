// "use client";
// import React from "react";
// import { useState } from "react";

// export default function MaintenancePage() {
//   const [selectedGauge1, setSelectedGauge1] = useState("parameter_1");
//   const [selectedGauge2, setSelectedGauge2] = useState("parameter_2");
//   const [selectedSensor1, setSelectedSensor1] = useState("sensor_1");
//   const [selectedSensor2, setSelectedSensor2] = useState("sensor_2");

//   const [thresholds, setThresholds] = useState({
//     threshold1: 5,
//     threshold2: 7,
//     threshold3: 8,
//     threshold4: 9,
//   });

//   const [isRunning, setIsRunning] = useState(false);

//   const maintenanceRecommendations = [
//     {
//       component: "Inlet Valve",
//       action: "Replace within 14 days",
//       priority: "high",
//       rul: 14,
//       confidence: 85,
//     },
//     {
//       component: "Pressure Sensor",
//       action: "Calibrate within 7 days",
//       priority: "medium",
//       rul: 7,
//       confidence: 92,
//     },
//     {
//       component: "Vibration Damper",
//       action: "Inspect within 30 days",
//       priority: "low",
//       rul: 30,
//       confidence: 78,
//     },
//     {
//       component: "Temperature Probe",
//       action: "Clean within 21 days",
//       priority: "medium",
//       rul: 21,
//       confidence: 88,
//     },
//   ];

//   const handleRun = () => {
//     setIsRunning(true);
//     setTimeout(() => setIsRunning(false), 3000);
//   };

//   return (
//     <div className="flex-1 p-4 overflow-auto">
//       <h1 className="text-2xl font-bold text-white mb-6">
//         Predictive Maintenance (PDM)
//       </h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         {/* Control Panel */}
//         <div className="bg-gray-800 border border-gray-700 rounded-lg">
//           <div className="p-4 border-b border-gray-700">
//             <h2 className="text-lg font-semibold text-white">
//               PDM Control Panel
//             </h2>
//           </div>
//           <div className="p-4 space-y-4">
//             {/* Threshold Controls */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//               {Object.entries(thresholds).map(([key, value], index) => (
//                 <div key={key} className="text-center">
//                   <label className="text-white text-sm mb-2 block">
//                     {key.replace("threshold", "treshold")}
//                   </label>
//                   <div className="relative">
//                     <div className="w-8 h-24 bg-gray-700 rounded mx-auto relative">
//                       <div
//                         className="absolute bottom-0 w-full bg-green-500 rounded"
//                         style={{ height: `${((value as number) / 10) * 100}%` }}
//                       />
//                       <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs">
//                         {value}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Dropdown Controls */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-gray-300 text-sm mb-2 block">
//                   Gauge_parameter_2
//                 </label>
//                 <select
//                   value={selectedGauge1}
//                   onChange={(e) => setSelectedGauge1(e.target.value)}
//                   className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
//                 >
//                   <option value="parameter_1">Parameter 1</option>
//                   <option value="parameter_2">Parameter 2</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-gray-300 text-sm mb-2 block">
//                   sensor_parameter_2
//                 </label>
//                 <select
//                   value={selectedSensor1}
//                   onChange={(e) => setSelectedSensor1(e.target.value)}
//                   className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
//                 >
//                   <option value="sensor_1">Sensor 1</option>
//                   <option value="sensor_2">Sensor 2</option>
//                 </select>
//               </div>
//             </div>

//             {/* Run Button */}
//             <div className="text-center mt-6">
//               <div className="bg-gray-600 px-8 py-2 rounded-t text-white font-bold">
//                 RUN
//               </div>
//               <button
//                 onClick={handleRun}
//                 disabled={isRunning}
//                 className={`w-full py-3 rounded-b font-bold ${
//                   isRunning
//                     ? "bg-yellow-600 text-white"
//                     : "bg-green-600 hover:bg-green-700 text-white"
//                 }`}
//               >
//                 {isRunning ? "Running..." : "Start Analysis"}
//               </button>
//             </div>

//             {/* Status Indicators */}
//             <div className="grid grid-cols-6 gap-2 mt-6">
//               {Array.from({ length: 12 }, (_, i) => (
//                 <div
//                   key={i}
//                   className={`w-8 h-8 rounded-full ${
//                     isRunning && i < 6 ? "bg-green-500" : "bg-gray-600"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* RUL Forecast */}
//         <div className="bg-gray-800 border border-gray-700 rounded-lg">
//           <div className="p-4 border-b border-gray-700">
//             <h2 className="text-lg font-semibold text-white">
//               Remaining Useful Life (RUL) Forecast
//             </h2>
//           </div>
//           <div className="p-4">
//             <div className="space-y-4">
//               <div className="text-center">
//                 <div className="text-4xl font-bold text-green-400 mb-2">
//                   45 days
//                 </div>
//                 <div className="text-gray-300">Estimated RUL</div>
//                 <div className="text-sm text-gray-400">Confidence: 87%</div>
//               </div>

//               <div className="bg-gray-700 p-4 rounded">
//                 <h4 className="text-white font-medium mb-2">
//                   Confidence Intervals
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Lower bound (95%):</span>
//                     <span className="text-yellow-400">38 days</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Upper bound (95%):</span>
//                     <span className="text-green-400">52 days</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-700 p-4 rounded">
//                 <h4 className="text-white font-medium mb-2">
//                   Failure Probability
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Next 7 days:</span>
//                     <span className="text-green-400">2%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Next 30 days:</span>
//                     <span className="text-yellow-400">15%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Next 60 days:</span>
//                     <span className="text-red-400">45%</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Maintenance Recommendations */}
//         <div className="bg-gray-800 border border-gray-700 rounded-lg">
//           <div className="p-4 border-b border-gray-700">
//             <h2 className="text-lg font-semibold text-white">
//               Maintenance Recommendations
//             </h2>
//           </div>
//           <div className="p-4">
//             <div className="space-y-4">
//               {maintenanceRecommendations.map((rec, index) => (
//                 <div
//                   key={index}
//                   className="bg-gray-700 p-4 rounded-lg border border-gray-600"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-white font-medium">
//                           {rec.component}
//                         </h3>
//                         <span
//                           className={`px-2 py-1 text-xs rounded ${
//                             rec.priority === "high"
//                               ? "bg-red-600 text-white"
//                               : rec.priority === "medium"
//                               ? "bg-yellow-600 text-white"
//                               : "bg-green-600 text-white"
//                           }`}
//                         >
//                           {rec.priority.toUpperCase()}
//                         </span>
//                       </div>
//                       <p className="text-gray-300 text-sm mb-2">{rec.action}</p>
//                       <div className="flex items-center gap-4">
//                         <span className="text-sm text-gray-400">
//                           RUL:{" "}
//                           <span className="text-white">{rec.rul} days</span>
//                         </span>
//                         <span className="text-sm text-gray-400">
//                           Confidence:{" "}
//                           <span className="text-green-400">
//                             {rec.confidence}%
//                           </span>
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <button className="px-3 py-1 text-sm border border-gray-600 text-white rounded hover:bg-gray-600">
//                         Schedule
//                       </button>
//                       <button className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded">
//                         Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"

import { useState } from "react"

export default function MaintenancePage() {
  const [selectedGauge, setSelectedGauge] = useState("parameter_1")
  const [selectedSensor, setSelectedSensor] = useState("sensor_1")
  const [thresholds, setThresholds] = useState({
    threshold1: 5,
    threshold2: 7,
    threshold3: 8,
    threshold4: 9,
  })
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 3000)
  }

  return (
    <div className="flex-1 bg-black text-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Controls */}
        <div className="space-y-6">
          {/* Threshold Sliders */}
          <div className="flex justify-center gap-8 mb-8">
            {Object.entries(thresholds).map(([key, value], index) => (
              <div key={key} className="text-center">
                <label className="text-white text-sm mb-2 block">{key.replace("threshold", "treshold")}</label>
                <div className="relative">
                  <div className="w-6 h-32 bg-gray-700 rounded mx-auto relative border border-gray-500">
                    <div
                      className="absolute bottom-0 w-full bg-green-500 rounded-b"
                      style={{ height: `${(value / 10) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-600 rounded-sm cursor-pointer"
                      style={{ top: `${100 - (value / 10) * 100}%` }}
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dropdown Controls */}
          <div className="flex gap-4 justify-center">
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Gauge_parameter_2</label>
              <select
                value={selectedGauge}
                onChange={(e) => setSelectedGauge(e.target.value)}
                className="w-48 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
              >
                <option value="parameter_1">Parameter 1</option>
                <option value="parameter_2">Parameter 2</option>
                <option value="parameter_3">Parameter 3</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">sensor_parameter_2</label>
              <select
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value)}
                className="w-48 bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
              >
                <option value="sensor_1">Sensor 1</option>
                <option value="sensor_2">Sensor 2</option>
                <option value="sensor_3">Sensor 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side - Run Button and Status */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Run Button */}
          <div className="text-center">
            <div className="bg-gray-600 px-16 py-3 text-white font-bold text-xl border-t border-l border-r border-gray-500">
              RUN
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-16 py-6 font-bold text-xl border-b border-l border-r border-gray-500 transition-colors ${
                isRunning ? "bg-yellow-600 text-white animate-pulse" : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isRunning ? "Running..." : "START"}
            </button>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full border-2 transition-colors ${
                  isRunning && i < 6 ? "bg-white border-gray-300" : "bg-gray-700 border-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
