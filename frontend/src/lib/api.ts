"use client"

import { API_BASE_URL } from "./config"

export interface SensorData {
  id: number
  timestamp: string
  pressure_in: number
  temperature_in: number
  flow_rate: number
  pressure_out: number
  temperature_out: number
  efficiency: number
  power_consumption: number
  vibration: number
  status: string
  frequency: number
  amplitude: number
  phase_angle: number
  mass: number
  stiffness: number
  damping: number
  density: number
  velocity: number
  viscosity: number
}

export interface PredictionData {
  rul_days: number
  confidence: number
  failure_probability: {
    next_7_days: number
    next_30_days: number
    next_60_days: number
  }
}

export interface OptimizationSuggestion {
  id: number
  title: string
  description: string
  impact: string
  priority: "high" | "medium" | "low"
  timestamp: string
}

class ApiService {
  async fetchLatestSensorData(): Promise<SensorData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sensor-data/latest`)
      if (!response.ok) {
        throw new Error("Failed to fetch sensor data")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching sensor data:", error)
      return this.getMockSensorData()
    }
  }

  async fetchPredictions(): Promise<PredictionData> {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions`)
      if (!response.ok) {
        throw new Error("Failed to fetch predictions")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching predictions:", error)
      return {
        rul_days: 45,
        confidence: 87,
        failure_probability: {
          next_7_days: 2,
          next_30_days: 15,
          next_60_days: 45,
        },
      }
    }
  }

  async fetchOptimizationSuggestions(): Promise<OptimizationSuggestion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/optimization/suggestions`)
      if (!response.ok) {
        throw new Error("Failed to fetch optimization suggestions")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching optimization suggestions:", error)
      return [
        {
          id: 1,
          title: "Inlet Valve Optimization",
          description: "Reduce inlet valve to 70% for a 5% efficiency gain",
          impact: "+5% efficiency",
          priority: "high",
          timestamp: new Date().toISOString(),
        },
      ]
    }
  }

  private getMockSensorData(): SensorData[] {
    return [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        pressure_in: 3.5 + (Math.random() - 0.5) * 0.4,
        temperature_in: 25 + (Math.random() - 0.5) * 10,
        flow_rate: 12.5 + (Math.random() - 0.5) * 2,
        pressure_out: 17.5 + (Math.random() - 0.5) * 3,
        temperature_out: 85 + (Math.random() - 0.5) * 15,
        efficiency: 82 + (Math.random() - 0.5) * 8,
        power_consumption: 450 + (Math.random() - 0.5) * 100,
        vibration: 1.2 + (Math.random() - 0.5) * 0.6,
        status: "Normal",
        frequency: 50 + (Math.random() - 0.5) * 4,
        amplitude: 0.5,
        phase_angle: 180,
        mass: 75,
        stiffness: 500000,
        damping: 500,
        density: 0.7,
        velocity: 30,
        viscosity: 0.00001,
      },
    ]
  }
}

export const apiService = new ApiService()
