import { io, Socket } from "socket.io-client";
import type { AppDispatch } from "../store/index";
import { setLatestSensor } from "../store/sensorSlice";

let socket: Socket | null = null;

export const connectWebSocket = (dispatch: AppDispatch) => {
  if (!socket) {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("start_stream"); 
      // Optionally notify backend to start stream if needed
      // socket.emit("start_stream");
    });

    socket.on("sensor_data", (data) => {
      console.log("Received sensor data:", data);
      dispatch(setLatestSensor(data));
    });
    

    socket.on("disconnect", () => {
      console.warn("WebSocket disconnected");
    });
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// "use client"

// export class WebSocketService {
//   private ws: WebSocket | null = null
//   private reconnectAttempts = 0
//   private maxReconnectAttempts = 5
//   private reconnectInterval = 5000
//   private listeners: Map<string, Function[]> = new Map()

//   constructor(private url = "ws://localhost:5000/ws") {}

//   connect() {
//     try {
//       this.ws = new WebSocket(this.url)

//       this.ws.onopen = () => {
//         console.log("WebSocket connected")
//         this.reconnectAttempts = 0
//         this.emit("connected", null)
//       }

//       this.ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data)
//           this.emit("data", data)

//           // Emit specific event types
//           if (data.type) {
//             this.emit(data.type, data.payload)
//           }
//         } catch (error) {
//           console.error("Error parsing WebSocket message:", error)
//         }
//       }

//       this.ws.onclose = () => {
//         console.log("WebSocket disconnected")
//         this.emit("disconnected", null)
//         this.attemptReconnect()
//       }

//       this.ws.onerror = (error) => {
//         console.error("WebSocket error:", error)
//         this.emit("error", error)
//       }
//     } catch (error) {
//       console.error("Failed to connect WebSocket:", error)
//       this.attemptReconnect()
//     }
//   }

//   private attemptReconnect() {
//     if (this.reconnectAttempts < this.maxReconnectAttempts) {
//       this.reconnectAttempts++
//       console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

//       setTimeout(() => {
//         this.connect()
//       }, this.reconnectInterval)
//     } else {
//       console.error("Max reconnection attempts reached")
//     }
//   }

//   on(event: string, callback: Function) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, [])
//     }
//     this.listeners.get(event)!.push(callback)
//   }

//   off(event: string, callback: Function) {
//     const eventListeners = this.listeners.get(event)
//     if (eventListeners) {
//       const index = eventListeners.indexOf(callback)
//       if (index > -1) {
//         eventListeners.splice(index, 1)
//       }
//     }
//   }

//   private emit(event: string, data: any) {
//     const eventListeners = this.listeners.get(event)
//     if (eventListeners) {
//       eventListeners.forEach((callback) => callback(data))
//     }
//   }

//   send(data: any) {
//     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify(data))
//     } else {
//       console.warn("WebSocket is not connected")
//     }
//   }

//   disconnect() {
//     if (this.ws) {
//       this.ws.close()
//       this.ws = null
//     }
//   }
// }

// export const wsService = new WebSocketService()
