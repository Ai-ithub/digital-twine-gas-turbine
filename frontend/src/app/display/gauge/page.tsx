// "use client"

// interface GaugeProps {
//   title: string
//   value: number
//   max: number
//   unit?: string
// }

// function CircularGauge({ title, value, max, unit = "" }: GaugeProps) {
//   const percentage = (value / max) * 100
//   const angle = (percentage / 100) * 270 - 135

//   return (
//     <div className="flex flex-col items-center bg-black p-2">
//       <div className="relative w-20 h-20">
//         <svg width="80" height="80" viewBox="0 0 80 80">
//           <path d="M 15 40 A 25 25 0 1 1 65 40" stroke="#374151" strokeWidth="2" fill="none" />
//           <path
//             d="M 15 40 A 25 25 0 1 1 65 40"
//             stroke="#10b981"
//             strokeWidth="2"
//             fill="none"
//             strokeDasharray={`${(percentage / 100) * 125} 125`}
//           />
//           {/* Tick marks */}
//           {Array.from({ length: 6 }, (_, i) => {
//             const tickAngle = -135 + i * 54
//             const x1 = 40 + 22 * Math.cos((tickAngle * Math.PI) / 180)
//             const y1 = 40 + 22 * Math.sin((tickAngle * Math.PI) / 180)
//             const x2 = 40 + 25 * Math.cos((tickAngle * Math.PI) / 180)
//             const y2 = 40 + 25 * Math.sin((tickAngle * Math.PI) / 180)

//             return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1" />
//           })}
//           <line
//             x1="40"
//             y1="40"
//             x2={40 + 18 * Math.cos((angle * Math.PI) / 180)}
//             y2={40 + 18 * Math.sin((angle * Math.PI) / 180)}
//             stroke="red"
//             strokeWidth="1"
//           />
//           <circle cx="40" cy="40" r="2" fill="red" />
//         </svg>
//       </div>
//       <div className="bg-white px-1 text-black text-xs font-bold mt-1">{value}</div>
//       <h4 className="text-white text-xs text-center mt-1">{title}</h4>
//     </div>
//   )
// }

// export default function SensorPage() {
//   return (
//     <div className="flex-1 bg-black text-white p-4">
//       {/* Top Row */}
//       <div className="grid grid-cols-6 gap-4 mb-6">
//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">T/C</h3>
//           <div className="space-y-4">
//             <CircularGauge title="Am Temp" value={250} max={1000} />
//             <CircularGauge title="In Temp" value={300} max={1000} />
//             <CircularGauge title="Out Temp" value={400} max={1000} />
//             <CircularGauge title="Outlet Air" value={200} max={600} />
//             <CircularGauge title="Tempe Data" value={350} max={800} />
//           </div>
//         </div>

//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">m/bar</h3>
//           <div className="space-y-4">
//             <CircularGauge title="Filter Difference" value={40} max={100} />
//             <CircularGauge title="Turbine Exhaust" value={60} max={100} />
//             <CircularGauge title="Compressor Discharge" value={50} max={100} />
//             <CircularGauge title="Pressure Data" value={45} max={100} />
//           </div>
//         </div>

//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">RPM</h3>
//           <div className="space-y-4">
//             <CircularGauge title="Turbine Speed" value={25} max={50} />
//             <CircularGauge title="rate of revolutions" value={30} max={50} />
//             <CircularGauge title="Vibration Data" value={35} max={50} />
//           </div>
//         </div>

//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">RPM</h3>
//           <div className="space-y-4">
//             <CircularGauge title="shaft torque" value={60} max={100} />
//             <CircularGauge title="Propeller Torque" value={45} max={100} />
//             <CircularGauge title="Starboard Propeller" value={55} max={100} />
//             <CircularGauge title="viscosity" value={40} max={100} />
//           </div>
//         </div>

//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">RPM</h3>
//           <div className="space-y-4">
//             <CircularGauge title="Input Power" value={400} max={1000} />
//             <CircularGauge title="Load Demand" value={300} max={1000} />
//             <CircularGauge title="Energy Yield" value={500} max={1000} />
//             <CircularGauge title="Decay State" value={200} max={1000} />
//           </div>
//         </div>

//         <div className="col-span-1">
//           <h3 className="text-white text-lg font-bold mb-4 text-center">RPM</h3>
//           <div className="space-y-4">
//             <CircularGauge title="Injection Control" value={60} max={100} />
//             <CircularGauge title="Efficiency" value={75} max={100} />
//             <CircularGauge title="Humidity" value={45} max={100} />
//             <CircularGauge title="Fuel Flow" value={55} max={100} />
//           </div>
//         </div>
//       </div>

//       {/* Bottom Row - Additional Measurements */}
//       <div className="grid grid-cols-4 gap-8 mt-8">
//         <div className="text-center">
//           <h3 className="text-white text-lg font-bold mb-4">mg/m3</h3>
//           <div className="flex gap-4 justify-center">
//             <CircularGauge title="Dioxide" value={2500} max={5000} />
//             <CircularGauge title="Monoxide" value={1800} max={5000} />
//           </div>
//         </div>

//         <div className="text-center">
//           <h3 className="text-white text-lg font-bold mb-4">Pressure</h3>
//           <div className="flex gap-2 justify-center">
//             <div className="bg-black p-2">
//               <h4 className="text-white text-xs mb-2">P_C</h4>
//               <div className="w-6 h-16 bg-gray-700 relative">
//                 <div className="absolute bottom-0 w-full bg-white h-3/4"></div>
//               </div>
//               <div className="bg-white text-black text-xs mt-1 px-1">100</div>
//             </div>
//             <div className="bg-black p-2">
//               <h4 className="text-white text-xs mb-2">P_T</h4>
//               <div className="w-6 h-16 bg-gray-700 relative">
//                 <div className="absolute bottom-0 w-full bg-white h-2/3"></div>
//               </div>
//               <div className="bg-white text-black text-xs mt-1 px-1">100</div>
//             </div>
//           </div>
//         </div>

//         <div className="text-center">
//           <h3 className="text-white text-lg font-bold mb-4">Viscosity</h3>
//           <div className="flex gap-2 justify-center">
//             <div className="bg-black p-2">
//               <h4 className="text-white text-xs mb-2">Temp_vis</h4>
//               <div className="w-6 h-16 bg-gray-700 relative">
//                 <div className="absolute bottom-0 w-full bg-white h-1/2"></div>
//               </div>
//               <div className="bg-white text-black text-xs mt-1 px-1">100</div>
//             </div>
//             <div className="bg-black p-2">
//               <h4 className="text-white text-xs mb-2">Flash Point</h4>
//               <div className="w-6 h-16 bg-gray-700 relative">
//                 <div className="absolute bottom-0 w-full bg-white h-3/5"></div>
//               </div>
//               <div className="bg-white text-black text-xs mt-1 px-1">100</div>
//             </div>
//             <div className="bg-black p-2">
//               <h4 className="text-white text-xs mb-2">TBN</h4>
//               <div className="w-6 h-16 bg-gray-700 relative">
//                 <div className="absolute bottom-0 w-full bg-white h-2/5"></div>
//               </div>
//               <div className="bg-white text-black text-xs mt-1 px-1">100</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client";

import React, { useEffect, useState } from "react";
import { Gauge } from "lucide-react";
import { CircularGauge } from "../../../components/CircularGauge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { connectWebSocket, disconnectWebSocket } from "../../../lib/websocket";

interface SensorData {
  pressure_in: number;
  pressure_out: number;
  temperature_in: number;
  temperature_out: number;
  flow_rate: number;
  efficiency: number;
  power_consumption: number;
  vibration: number;
}

export default function GaugePage() {
  const colors = [
    "#10b981", // سبز روشن
    "#3b82f6", // آبی
    "#f59e0b", // زرد
    "#ef4444", // قرمز
    "#8b5cf6", // بنفش
    "#14b8a6", // فیروزه‌ای
    "#f97316", // نارنجی
    "#6366f1", // نیلی
  ];
  const dispatch = useDispatch<AppDispatch>();
  const realTimeData = useSelector((state: RootState) => state.sensor.latest);

  useEffect(() => {
    connectWebSocket(dispatch);
    return () => {
      disconnectWebSocket();
    };
  }, [dispatch]);

  if (!realTimeData)
    return <div className="text-white p-4">Loading sensor data...</div>;
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Gauge size={28} />
        Real-Time Gauges
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CircularGauge
          title="Pressure In"
          value={realTimeData.pressure_in}
          unit="bar"
          max={10}
          color={colors[0]}
        />
        <CircularGauge
          title="Pressure Out"
          value={realTimeData.pressure_out}
          unit="bar"
          max={10}
          color={colors[1]}
        />
        <CircularGauge
          title="Temperature In"
          value={realTimeData.temperature_in}
          unit="°C"
          max={100}
          color={colors[2]}
        />
        <CircularGauge
          title="Temperature Out"
          value={realTimeData.temperature_out}
          unit="°C"
          max={100}
          color={colors[3]}
        />
        <CircularGauge
          title="Flow Rate"
          value={realTimeData.flow_rate}
          unit="m³/min"
          max={200}
          color={colors[4]}
        />
        <CircularGauge
          title="Efficiency"
          value={realTimeData.efficiency}
          unit="%"
          max={100}
          color={colors[5]}
        />
        <CircularGauge
          title="Power"
          value={realTimeData.power_consumption}
          unit="kW"
          max={500}
          color={colors[6]}
        />
        <CircularGauge
          title="Vibration"
          value={realTimeData.vibration}
          unit="Hz"
          max={100}
          color={colors[7]}
        />
      </div>
    </div>
  );
}
