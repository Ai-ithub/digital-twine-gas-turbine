export interface SensorData {
    TimeData: string; // TIMESTAMP
    Pressure_In: number;
    Temperature_In: number;
    Flow_Rate: number;
    Pressure_Out: number;
    Temperature_Out: number;
    Efficiency: number;
    Power_Consumption: number;
    Vibration: number;
    Frequency?: number;
    Amplitude?: number;
    Phase_Angle?: number;
    Mass?: number;
    Stiffness?: number;
    Damping?: number;
    Density?: number;
    Velocity?: number;
    Viscosity?: number;
  }
  