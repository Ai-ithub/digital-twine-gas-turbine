// "use client"
// import React from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import {
//   Activity,
//   BarChart3,
//   Gauge,
//   Home,
//   Settings,
//   Wrench,
//   AlertTriangle,
//   CheckSquare,
//   Box,
//   FileText,
//   Wifi,
//   Database,
//   HardDrive,
//   Smartphone,
//   Thermometer,
//   Video,
// } from "lucide-react"

// const menuItems = [
//   { title: "display", url: "/", icon: Home },
//   { title: "check list", url: "/checklist", icon: CheckSquare },
//   { title: "Alarm Systems", url: "/alarms", icon: AlertTriangle },
//   { title: "Control", url: "/control", icon: Settings },
//   { title: "Graph_Analysis", url: "/graph-analysis", icon: BarChart3 },
//   { title: "3D Analysis_OP", url: "/3d-analysis", icon: Box },
//   { title: "REAL_TIME_OP", url: "/monitoring", icon: Activity },
//   { title: "Reporting", url: "/reporting", icon: FileText },
//   { title: "Connection", url: "/connection", icon: Wifi },
//   { title: "Data Loggers", url: "/data-loggers", icon: Database },
//   { title: "Databases", url: "/databases", icon: HardDrive },
//   { title: "GSM", url: "/gsm", icon: Smartphone },
//   { title: "ThermoVision", url: "/thermovision", icon: Thermometer },
//   { title: "PDM", url: "/maintenance", icon: Wrench },
//   { title: "DVR", url: "/dvr", icon: Video },
// ]

// export function AppSidebar() {
//   const pathname = usePathname()

//   return (
//     <div className="w-64 bg-green-600 border-r border-gray-700 flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-green-700">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-green-800 rounded flex items-center justify-center">
//             <Gauge className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <h2 className="text-white font-semibold">TURBIN</h2>
//             <p className="text-green-200 text-xs">Generator</p>
//           </div>
//         </div>
//       </div>

//       {/* Menu Items */}
//       <nav className="flex-1 p-2">
//         <div className="text-white text-xs font-medium px-2 py-1 mb-2">SYSTEM MODULES</div>
//         <div className="space-y-1">
//           {menuItems.map((item) => {
//             const Icon = item.icon
//             const isActive = pathname === item.url

//             return (
//               <Link
//                 key={item.title}
//                 href={item.url}
//                 className={`
//                   flex items-center gap-2 px-2 py-2 text-xs rounded-lg transition-colors
//                   ${isActive ? "bg-green-700 text-white" : "text-green-100 hover:bg-green-700 hover:text-white"}
//                 `}
//               >
//                 <Icon className="w-4 h-4 flex-shrink-0" />
//                 <span className="truncate">{item.title}</span>
//               </Link>
//             )
//           })}
//         </div>
//       </nav>
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BarChart3,
  Gauge,
  Home,
  Settings,
  Wrench,
  AlertTriangle,
  CheckSquare,
  Box,
  FileText,
  Wifi,
  Database,
  HardDrive,
  Smartphone,
  Thermometer,
  Video,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  {
    title: "display",
    url: "/",
    icon: Home,
    subItems: [
      { title: "Gauge", url: "/display/gauge" },
      { title: "SENSOR", url: "/display/sensor" },
      { title: "REAL_TIME_M", url: "/display/realtime" },
    ],
  },
  { title: "check list", url: "/checklist", icon: CheckSquare },
  { title: "Alarm Systems", url: "/alarms", icon: AlertTriangle },
  { title: "Control", url: "/control", icon: Settings },
  { title: "Graph_Analysis", url: "/graph-analysis", icon: BarChart3 },
  { title: "3D Analysis_OP", url: "/3d-analysis", icon: Box },
  { title: "REAL_TIME_OP", url: "/monitoring", icon: Activity },
  { title: "Reporting", url: "/reporting", icon: FileText },
  { title: "Connection", url: "/connection", icon: Wifi },
  { title: "Data Loggers", url: "/data-loggers", icon: Database },
  { title: "Databases", url: "/databases", icon: HardDrive },
  { title: "GSM", url: "/gsm", icon: Smartphone },
  { title: "ThermoVision", url: "/thermovision", icon: Thermometer },
  { title: "PDM", url: "/maintenance", icon: Wrench },
  { title: "DVR", url: "/dvr", icon: Video },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["display"])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <div className="w-40 bg-green-500 border-r border-green-600 flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-3 border-b border-green-600 bg-green-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-800 rounded flex items-center justify-center">
            <Gauge className="w-3 h-3 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">TURBIN</h2>
            <p className="text-green-200 text-xs">Generator</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-1">
        <div className="space-y-0">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.url || (item.subItems && item.subItems.some((sub) => pathname === sub.url))
            const isExpanded = expandedItems.includes(item.title)
            const hasSubItems = item.subItems && item.subItems.length > 0

            return (
              <div key={item.title}>
                <div
                  className={`
                    flex items-center justify-between px-2 py-1 text-xs transition-colors cursor-pointer
                    ${isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-600"}
                  `}
                  onClick={() => (hasSubItems ? toggleExpanded(item.title) : null)}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 flex-1"
                    onClick={(e) => hasSubItems && e.preventDefault()}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate text-xs">{item.title}</span>
                  </Link>
                  {hasSubItems && (
                    <div className="ml-1">
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  )}
                </div>

                {hasSubItems && isExpanded && (
                  <div className="ml-4 border-l border-green-600">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.url}
                        className={`
                          block px-2 py-1 text-xs transition-colors
                          ${pathname === subItem.url ? "bg-green-800 text-white" : "text-green-100 hover:bg-green-700 hover:text-white"}
                        `}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
