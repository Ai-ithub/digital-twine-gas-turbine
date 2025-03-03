import React, { useState, useEffect } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { FaExclamationTriangle } from "react-icons/fa";

interface HeatMapData {
  id: string;
  data: { x: string; y: number }[];
}

const CompressorHeatMap: React.FC = () => {
  const [data, setData] = useState<HeatMapData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const generateMockData = (): HeatMapData[] => {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const segments = ["Segment A", "Segment B", "Segment C", "Segment D", "Segment E"];
      
      return segments.map(segment => ({
        id: segment,
        data: hours.map(hour => ({
          x: hour,
          y: Math.random() * 100
        }))
      }));
    };

    try {
      const mockData = generateMockData();
      setData(mockData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load heat map data");
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 text-red-600">
        <FaExclamationTriangle className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Compressor Risk Heat Map</h2>
      
      <div className="h-96 w-full">
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
          valueFormat=">-.2f"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Time",
            legendPosition: "middle",
            legendOffset: -40
          }}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Time",
            legendPosition: "middle",
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Compressor Segments",
            legendPosition: "middle",
            legendOffset: -70
          }}
          colors={{
            type: "sequential",
            scheme: "red_yellow_green",
            // reverse: true
          }}
          emptyColor="#ffffff"
          borderColor="#ffffff"
          borderWidth={1}
          enableLabels={true}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 2]]
          }}
        //   annotations={[{
        //     type: "rect",
        //     match: { id: "Segment A" },
        //     noteTextOffset: 5,
        //     noteWidth: 200,
        //     noteHeight: 30,
        //     noteTextColor: "#000000"
        //   }]}
          hoverTarget="cell"
        //   tooltip={({ xKey, yKey, value }) => (
        //     <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
        //       <strong>Segment:</strong> {yKey}<br />
        //       <strong>Time:</strong> {xKey}<br />
        //       <strong>Risk Level:</strong> {value.toFixed(2)}
        //     </div>
        //   )}
          theme={{
            tooltip: {
              container: {
                background: "white",
                fontSize: 12,
              },
            },
            labels: {
              text: {
                fontSize: 11,
                fill: "#333333",
              },
            },
            axis: {
              legend: {
                text: {
                  fontSize: 12,
                  fill: "#333333",
                },
              },
            },
          }}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressorHeatMap;