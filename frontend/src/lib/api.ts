import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

export const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SensorData {
  id: number;
  timestamp: string;
  pressure_in: number;
  temperature_in: number;
  flow_rate: number;
  pressure_out: number;
  temperature_out: number;
  efficiency: number;
  power_consumption: number;
  vibration: number;
  status: string;
  frequency: number;
  amplitude: number;
  phase_angle: number;
  mass: number;
  stiffness: number;
  damping: number;
  density: number;
  velocity: number;
  viscosity: number;
}

export async function fetchLatestSensorData(
  systemParam?: string,
  gaugeParam?: string,
  sensorParam?: string
): Promise<SensorData[]> {
  try {
    const res = await API.get<SensorData[]>("/sensor-data/latest");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch latest sensor data", error);
    throw new Error("Failed to fetch latest sensor data");
  }
}

export async function getSensorData(): Promise<SensorData[]> {
  return await fetchLatestSensorData();
}





// export const API_BASE_URL = "http://localhost:5000";

// export interface SensorData {
//   id: number;
//   timestamp: string;
//   pressure_in: number;
//   temperature_in: number;
//   flow_rate: number;
//   pressure_out: number;
//   temperature_out: number;
//   efficiency: number;
//   power_consumption: number;
//   vibration: number;
//   status: string;
//   frequency: number;
//   amplitude: number;
//   phase_angle: number;
//   mass: number;
//   stiffness: number;
//   damping: number;
//   density: number;
//   velocity: number;
//   viscosity: number;
// }

// export async function fetchLatestSensorData(
//   systemParam: string,
//   gaugeParam: string,
//   sensorParam: string
// ): Promise<SensorData[]> {
//   const res = await fetch(`${API_BASE_URL}/sensor-data/latest`);
//   if (!res.ok) {
//     throw new Error("Failed to fetch latest sensor data");
//   }
//   const data = await res.json();
//   return data;
// }
// export async function getSensorData(): Promise<SensorData[]> {
//   const res = await fetch(`${API_BASE_URL}/sensor-data/latest`);
//   if (!res.ok) throw new Error("Failed to fetch sensor data");
//   return await res.json();
// }

