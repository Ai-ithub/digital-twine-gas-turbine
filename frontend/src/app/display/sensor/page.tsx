"use client"

interface GaugeProps {
  title: string
  value: number
  max: number
  unit?: string
  size?: number
}

function CircularGauge({ title, value, max, unit = "", size = 120 }: GaugeProps) {
  const percentage = (value / max) * 100
  const angle = (percentage / 100) * 270 - 135 // 270 degree range starting from -135deg

  return (
    <div className="flex flex-col items-center bg-black p-4 rounded">
      <h3 className="text-white text-sm font-medium mb-2">{title}</h3>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120" className="transform">
          {/* Background arc */}
          <path d="M 20 60 A 40 40 0 1 1 100 60" stroke="#374151" strokeWidth="3" fill="none" />
          {/* Value arc */}
          <path
            d="M 20 60 A 40 40 0 1 1 100 60"
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 188} 188`}
          />
          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => {
            const tickAngle = -135 + i * 27
            const x1 = 60 + 35 * Math.cos((tickAngle * Math.PI) / 180)
            const y1 = 60 + 35 * Math.sin((tickAngle * Math.PI) / 180)
            const x2 = 60 + 40 * Math.cos((tickAngle * Math.PI) / 180)
            const y2 = 60 + 40 * Math.sin((tickAngle * Math.PI) / 180)

            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1" />
          })}
          {/* Needle */}
          <line
            x1="60"
            y1="60"
            x2={60 + 30 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 30 * Math.sin((angle * Math.PI) / 180)}
            stroke="red"
            strokeWidth="2"
          />
          {/* Center dot */}
          <circle cx="60" cy="60" r="3" fill="red" />
        </svg>

        {/* Value display */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-black text-xs font-bold">
          {value} {unit}
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-full text-xs text-white mt-2">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function VerticalBar({ title, value, max }: { title: string; value: number; max: number }) {
  const percentage = (value / max) * 100

  return (
    <div className="flex flex-col items-center bg-black p-2">
      <h4 className="text-white text-xs mb-2 text-center">{title}</h4>
      <div className="relative w-8 h-24 bg-gray-700 border border-gray-500">
        <div
          className="absolute bottom-0 w-full bg-white transition-all duration-300"
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute top-0 text-xs text-white -left-6">{max}</div>
        <div className="absolute bottom-0 text-xs text-white -left-6">0</div>
      </div>
      <div className="bg-white px-1 mt-1 text-black text-xs font-bold">{value}</div>
    </div>
  )
}

export default function GaugePage() {
  return (
    <div className="flex-1 bg-black text-white p-4">
      {/* Top Row - Main Gauges */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="Frequency" value={50} max={100} />
        <CircularGauge title="Absolute Pressure" value={600} max={1000} unit="psi-compers" />
        <CircularGauge title="Static Pressure" value={400} max={1000} unit="psi-compers_s" />
        <CircularGauge title="Dynamic Pressure" value={300} max={1000} unit="psi-compers_s" />
        <div className="bg-black p-4 rounded">
          <h3 className="text-white text-sm font-medium mb-4 text-center">Pressure</h3>
          <div className="flex gap-4 justify-center">
            <VerticalBar title="P_C" value={75} max={100} />
            <VerticalBar title="P_T" value={85} max={100} />
          </div>
        </div>
      </div>

      {/* Second Row - Additional Gauges */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <CircularGauge title="amplitude" value={400} max={800} />
        <CircularGauge title="psi-turbin" value={500} max={1000} />
        <CircularGauge title="psi-turbin_2" value={300} max={1000} />
        <CircularGauge title="psi-turbin" value={450} max={1000} />
        <div className="bg-black p-4 rounded flex justify-center">
          <VerticalBar title="θ" value={60} max={100} />
        </div>
      </div>

      {/* TEMP Section */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-white text-lg font-bold mb-4 text-center">TEMP</h2>
        <div className="grid grid-cols-10 gap-2">
          <VerticalBar title="Relative Temp" value={75} max={100} />
          <VerticalBar title="Surface Temp" value={60} max={100} />
          <VerticalBar title="Internal Temp" value={80} max={100} />
          <VerticalBar title="Point Temp" value={45} max={100} />
          <VerticalBar title="Fluctuating Temp" value={90} max={100} />
          <VerticalBar title="Freezing Point" value={30} max={100} />
          <VerticalBar title="Dew Point" value={55} max={100} />
          <VerticalBar title="Temp_vis" value={70} max={100} />
          <VerticalBar title="Flash Point" value={85} max={100} />
          <VerticalBar title="TBN" value={40} max={100} />
        </div>
      </div>

      {/* Viscosity Section */}
      <div className="mt-4 text-center">
        <h3 className="text-white text-lg font-medium">Viscosity</h3>
      </div>
    </div>
  )
}