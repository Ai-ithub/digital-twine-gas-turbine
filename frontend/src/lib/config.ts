"use client"

// Create a configuration object that handles environment variables safely
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws",
} as const

// Export individual values
// export const API_BASE_URL = config.apiUrl
export const WS_BASE_URL = config.wsUrl
export const API_BASE_URL = "http://localhost:3000";

