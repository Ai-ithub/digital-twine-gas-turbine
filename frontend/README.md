# SGT-400 Compressor Dashboard

A comprehensive React-based dashboard for real-time monitoring and AI-driven analytics of the SGT-400 compressor system.

## Features

- **Real-time Monitoring**: Live sensor data visualization with WebSocket integration
- **Predictive Maintenance**: AI-powered failure prediction and maintenance scheduling
- **Optimization**: Real-time optimization suggestions for improved efficiency
- **Industrial UI**: Dark theme with high contrast following Siemens industrial guidelines
- **Responsive Design**: Optimized for desktop and tablet devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend Integration**: REST API + WebSocket

## Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Setup**
   Create a `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
   \`\`\`

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── page.tsx           # Overview dashboard
│   ├── monitoring/        # Real-time monitoring
│   ├── optimization/      # RTO suggestions
│   └── maintenance/       # Predictive maintenance
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── circular-gauge.tsx # Custom gauge component
│   ├── temperature-bar.tsx # Temperature visualization
│   └── realtime-chart.tsx # Live data charts
└── lib/                  # Utilities and services
    ├── api.ts            # API service layer
    └── websocket.ts      # WebSocket client
\`\`\`

## API Integration

The dashboard integrates with a Flask backend providing:

- `/api/sensor-data/latest` - Latest sensor readings
- `/api/predictions` - PdM forecasts and RUL
- `/api/optimization/suggestions` - RTO recommendations
- WebSocket endpoint for real-time data streams

## Key Components

### Overview Dashboard
- KPI summary with circular gauges
- Temperature monitoring with vertical bars
- Real-time trend charts
- System status indicators

### Real-time Monitoring
- Live sensor data visualization
- Noise signal analysis
- Histogram charts for data distribution
- Configurable time ranges and parameters

### Optimization
- Algorithm configuration interface
- Intensity graphs for optimization visualization
- Real-time suggestions with priority levels
- Performance impact indicators

### Predictive Maintenance
- RUL forecasting with confidence intervals
- Failure probability analysis
- Component-specific maintenance recommendations
- Threshold-based alert system

## Deployment

1. **Build for Production**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start Production Server**
   \`\`\`bash
   npm start
   \`\`\`

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Maintain responsive design principles
4. Test with both mock and real API data
5. Follow industrial UI guidelines for consistency

## License

This project is proprietary software for SGT-400 compressor monitoring systems.
