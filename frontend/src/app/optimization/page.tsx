// "use client"
// import React from 'react'
// import { useState } from "react"

// export default function OptimizationPage() {
//   const [standardFunction, setStandardFunction] = useState("function_1")
//   const [algorithm, setAlgorithm] = useState("quasi_newton")
//   const [optimizationMethod, setOptimizationMethod] = useState("Quasi-newton")
//   const [gradientMethod, setGradientMethod] = useState("Polak-Ribiere")
//   const [lineMinimization, setLineMinimization] = useState("With Derivatives")

//   const [stoppingCriteria, setStoppingCriteria] = useState({
//     functionTolerance: "1E-06",
//     parameterTolerance: "1E-10",
//     gradientTolerance: "1E-06",
//     maximumIterations: "10000",
//     maximumFunctionCalls: "10000",
//     minimumTime: "1",
//   })

//   const [suggestions, setSuggestions] = useState([
//     {
//       id: 1,
//       title: "Inlet Valve Optimization",
//       description: "Reduce inlet valve to 70% for a 5% efficiency gain",
//       impact: "+5% efficiency",
//       priority: "high",
//     },
//     {
//       id: 2,
//       title: "Pressure Ratio Adjustment",
//       description: "Optimize pressure ratio to 4.8 for better performance",
//       impact: "+3% power output",
//       priority: "medium",
//     },
//     {
//       id: 3,
//       title: "Temperature Control",
//       description: "Adjust inlet temperature to 22°C for optimal operation",
//       impact: "+2% efficiency",
//       priority: "low",
//     },
//   ])

//   return (
//     <div className="flex-1 p-4 overflow-auto">
//       <h1 className="text-2xl font-bold text-white mb-6">Real-Time Optimization</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Optimization Controls */}
//         <div className="space-y-6">
//           <div className="bg-gray-800 border border-gray-700 rounded-lg">
//             <div className="p-4 border-b border-gray-700">
//               <h2 className="text-lg font-semibold text-white">Optimization Settings</h2>
//             </div>
//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-gray-300 text-sm mb-2">Standard Functions</label>
//                 <select
//                   value={standardFunction}
//                   onChange={(e) => setStandardFunction(e.target.value)}
//                   className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
//                 >
//                   <option value="function_1">Function 1</option>
//                   <option value="function_2">Function 2</option>
//                   <option value="function_3">Function 3</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-gray-300 text-sm mb-2">Algorithms</label>
//                 <select
//                   value={algorithm}
//                   onChange={(e) => setAlgorithm(e.target.value)}
//                   className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
//                 >
//                   <option value="quasi_newton">Quasi-Newton</option>
//                   <option value="gradient_descent">Gradient Descent</option>
//                   <option value="genetic_algorithm">Genetic Algorithm</option>
//                 </select>
//               </div>

//               <div className="bg-green-100 p-4 rounded">
//                 <h4 className="font-medium text-gray-800 mb-3">Stopping Criteria</h4>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="text-xs text-gray-600">function tolerance</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.functionTolerance}
//                       onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, functionTolerance: e.target.value }))}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">parameter tolerance</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.parameterTolerance}
//                       onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, parameterTolerance: e.target.value }))}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">gradient tolerance</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.gradientTolerance}
//                       onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, gradientTolerance: e.target.value }))}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">maximum iterations</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.maximumIterations}
//                       onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, maximumIterations: e.target.value }))}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">maximum function calls</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.maximumFunctionCalls}
//                       onChange={(e) =>
//                         setStoppingCriteria((prev) => ({ ...prev, maximumFunctionCalls: e.target.value }))
//                       }
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">minimum time</label>
//                     <input
//                       type="text"
//                       value={stoppingCriteria.minimumTime}
//                       onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, minimumTime: e.target.value }))}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-green-100 p-4 rounded">
//                 <h4 className="font-medium text-gray-800 mb-2">Optimization Method</h4>
//                 <div className="bg-white p-2 rounded text-center text-gray-800 font-medium">{optimizationMethod}</div>
//               </div>

//               <div className="bg-green-100 p-4 rounded">
//                 <h4 className="font-medium text-gray-800 mb-3">Conjugate Gradient Settings</h4>
//                 <div className="space-y-2">
//                   <div>
//                     <label className="text-xs text-gray-600">gradient method</label>
//                     <select
//                       value={gradientMethod}
//                       onChange={(e) => setGradientMethod(e.target.value)}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     >
//                       <option value="Polak-Ribiere">Polak-Ribiere</option>
//                       <option value="Fletcher-Reeves">Fletcher-Reeves</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-600">line minimization</label>
//                     <select
//                       value={lineMinimization}
//                       onChange={(e) => setLineMinimization(e.target.value)}
//                       className="w-full bg-white border border-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
//                     >
//                       <option value="With Derivatives">With Derivatives</option>
//                       <option value="Without Derivatives">Without Derivatives</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Intensity Graph */}
//         <div className="bg-gray-800 border border-gray-700 rounded-lg">
//           <div className="p-4 border-b border-gray-700">
//             <h2 className="text-white text-xl font-bold text-center">Intensity Graph_8</h2>
//           </div>
//           <div className="p-4">
//             <div className="relative">
//               {/* Intensity Graph Canvas */}
//               <div className="bg-gradient-to-br from-blue-900 via-green-500 to-red-500 rounded border border-gray-600 h-80">
//                 <svg width="100%" height="100%" viewBox="0 0 400 300">
//                   {/* Grid lines */}
//                   <defs>
//                     <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
//                       <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#666" strokeWidth="1" />
//                     </pattern>
//                   </defs>
//                   <rect width="100%" height="100%" fill="url(#grid-pattern)" />

//                   {/* Simulated intensity heatmap points */}
//                   {Array.from({ length: 50 }, (_, i) => (
//                     <circle
//                       key={i}
//                       cx={Math.random() * 380 + 10}
//                       cy={Math.random() * 280 + 10}
//                       r={Math.random() * 8 + 2}
//                       fill={`hsl(${Math.random() * 360}, 70%, 50%)`}
//                       opacity={0.7}
//                     />
//                   ))}

//                   {/* Axis labels */}
//                   <text x="200" y="295" textAnchor="middle" fill="white" fontSize="12">
//                     x(t-1)
//                   </text>
//                   <text x="15" y="150" textAnchor="middle" fill="white" fontSize="12" transform="rotate(-90 15 150)">
//                     x(t)
//                   </text>
//                 </svg>
//               </div>

//               {/* Color scale legend */}
//               <div className="absolute right-2 top-2 w-6 h-48 bg-gradient-to-t from-blue-500 via-green-500 to-red-500 rounded">
//                 <div className="absolute -right-12 top-0 text-xs text-white">2500</div>
//                 <div className="absolute -right-12 top-12 text-xs text-white">2000</div>
//                 <div className="absolute -right-12 top-24 text-xs text-white">1500</div>
//                 <div className="absolute -right-12 top-36 text-xs text-white">1000</div>
//                 <div className="absolute -right-12 bottom-0 text-xs text-white">0</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Optimization Suggestions */}
//       <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg">
//         <div className="p-4 border-b border-gray-700">
//           <h2 className="text-white text-xl font-bold">Real-Time Optimization Suggestions</h2>
//         </div>
//         <div className="p-4">
//           <div className="space-y-4">
//             {suggestions.map((suggestion) => (
//               <div key={suggestion.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h3 className="text-white font-medium mb-2">{suggestion.title}</h3>
//                     <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
//                     <div className="flex items-center gap-4">
//                       <span className="text-green-400 text-sm font-medium">{suggestion.impact}</span>
//                       <span
//                         className={`px-2 py-1 rounded text-xs ${
//                           suggestion.priority === "high"
//                             ? "bg-red-600 text-white"
//                             : suggestion.priority === "medium"
//                               ? "bg-yellow-600 text-white"
//                               : "bg-blue-600 text-white"
//                         }`}
//                       >
//                         {suggestion.priority.toUpperCase()}
//                       </span>
//                     </div>
//                   </div>
//                   <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
//                     Apply
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import { IntensityGraph } from "../../components/Intensity_graph"

export default function OptimizationPage() {
  const [standardFunction, setStandardFunction] = useState("function_1")
  const [algorithm, setAlgorithm] = useState("quasi_newton")
  const [stoppingCriteria, setStoppingCriteria] = useState({
    functionTolerance: "1E-06",
    parameterTolerance: "1E-10",
    gradientTolerance: "1E-06",
    maximumIterations: "10000",
    maximumFunctionCalls: "10000",
    minimumTime: "1",
  })
  const [gradientMethod, setGradientMethod] = useState("Polak-Ribiere")
  const [lineMinimization, setLineMinimization] = useState("With Derivatives")

  return (
    <div className="flex-1 bg-black text-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Control Panel */}
        <div className="space-y-6">
          {/* Standard Functions */}
          <div className="bg-green-400 p-4 rounded">
            <h3 className="text-black font-medium mb-3">standard_Functions</h3>
            <select
              value={standardFunction}
              onChange={(e) => setStandardFunction(e.target.value)}
              className="w-full bg-white border border-gray-300 text-black px-3 py-2 rounded"
            >
              <option value="function_1">Function 1</option>
              <option value="function_2">Function 2</option>
              <option value="function_3">Function 3</option>
            </select>
          </div>

          {/* Algorithms */}
          <div className="bg-green-400 p-4 rounded">
            <h3 className="text-black font-medium mb-3">Algorithms</h3>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full bg-white border border-gray-300 text-black px-3 py-2 rounded"
            >
              <option value="quasi_newton">Quasi-Newton</option>
              <option value="gradient_descent">Gradient Descent</option>
              <option value="genetic_algorithm">Genetic Algorithm</option>
            </select>
          </div>

          {/* Stopping Criteria */}
          <div className="bg-green-400 p-4 rounded">
            <h3 className="text-black font-medium mb-3">Stopping Criteria</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-black">function tolerance</label>
                <input
                  type="text"
                  value={stoppingCriteria.functionTolerance}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, functionTolerance: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-black">parameter tolerance</label>
                <input
                  type="text"
                  value={stoppingCriteria.parameterTolerance}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, parameterTolerance: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-black">gradient tolerance</label>
                <input
                  type="text"
                  value={stoppingCriteria.gradientTolerance}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, gradientTolerance: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-black">maximum iterations</label>
                <input
                  type="text"
                  value={stoppingCriteria.maximumIterations}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, maximumIterations: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-black">maximum function calls</label>
                <input
                  type="text"
                  value={stoppingCriteria.maximumFunctionCalls}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, maximumFunctionCalls: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-black">minimum time</label>
                <input
                  type="text"
                  value={stoppingCriteria.minimumTime}
                  onChange={(e) => setStoppingCriteria((prev) => ({ ...prev, minimumTime: e.target.value }))}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Optimization Method */}
          <div className="bg-green-400 p-4 rounded">
            <h3 className="text-black font-medium mb-2">Optimization Method</h3>
            <div className="bg-white p-2 rounded text-center text-black font-medium">Quasi-newton</div>
          </div>

          {/* Conjugate Gradient Settings */}
          <div className="bg-green-400 p-4 rounded">
            <h3 className="text-black font-medium mb-3">Conjugate Gradient Settings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-black">gradient method</label>
                <select
                  value={gradientMethod}
                  onChange={(e) => setGradientMethod(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                >
                  <option value="Polak-Ribiere">Polak-Ribiere</option>
                  <option value="Fletcher-Reeves">Fletcher-Reeves</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-black">line minimization</label>
                <select
                  value={lineMinimization}
                  onChange={(e) => setLineMinimization(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs"
                >
                  <option value="With Derivatives">With Derivatives</option>
                  <option value="Without Derivatives">Without Derivatives</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Intensity Graph */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-white text-xl font-bold text-center mb-4">Intensity Graph_8</h2>
          <IntensityGraph />
        </div>
      </div>
    </div>
  )
}
