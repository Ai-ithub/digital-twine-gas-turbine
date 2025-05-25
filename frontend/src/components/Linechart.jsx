/////Linechart
// import { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
// import axios from "axios";

// const Linechart = () => {
//   const [data, setData] = useState([]);
//   const [selectedParam, setSelectedParam] = useState("efficiency");
//   const [yDomain, setYDomain] = useState([0, 100]);
//   const [xDomain, setXDomain] = useState([0, 100]);
//   const [allParams, setAllParams] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:5000/get_all_data").then((res) => {
//       const receivedData = res.data;

//       if (receivedData.length === 0) return;

//       const excludedKeys = ["status", "timestamp", "id"];

//       // محاسبه زمان شروع از اولین timestamp
//       const startTime = new Date(receivedData[0].timestamp).getTime();

//       const transformed = receivedData.map((item) => {
//         const currentTime = new Date(item.timestamp).getTime();
//         const secondsElapsed = Math.floor((currentTime - startTime) / 1000);
//         return {
//           time: secondsElapsed,
//           ...item,
//         };
//       });

//       setData(transformed);

//       // گرفتن نام پارامترها
//       const keys = Object.keys(transformed[0]).filter((k) => !excludedKeys.includes(k));
//       setAllParams(keys);

//       // محاسبه دامنه محور X
//       const maxTime = Math.max(...transformed.map((d) => d.time));
//       setXDomain([0, Math.max(100, maxTime)]);
//     });
//   }, []);

//   useEffect(() => {
//     if (data.length > 0 && selectedParam) {
//       const values = data.map((d) => d[selectedParam]);
//       const min = Math.min(...values);
//       const max = Math.max(...values);
//       const range = max - min;

//       let margin = 0;
//       if (range > 1) {
//         const marginRatio = 0.1;
//         margin = Math.max(range * marginRatio, 5);
//       }

//       const adjustedMin = Math.floor(min - margin);
//       const adjustedMax = Math.ceil(max + margin);
//       setYDomain([adjustedMin, adjustedMax]);
//     }
//   }, [selectedParam, data]);

//   return (
//     <div className="p-4 rounded-xl shadow bg-white w-[620px]">
//       <div dir="rtl">
//         <h2 className="text-xl font-semibold mb-2 ">
//           نمودار پارامتر:
//           <span> {selectedParam}</span>
//         </h2>
//         <div className="mb-4">
//           <label className="mr-2 ">پارامتر را انتخاب کنید: </label>
//           <select
//             className="border px-2 py-1 rounded text-left"
//             value={selectedParam}
//             onChange={(e) => setSelectedParam(e.target.value)}
//           >
//             {allParams.map((param) => (
//               <option key={param} value={param}>
//                 {param}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <LineChart
//         width={600}
//         height={350}
//         data={data}
//         margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//       >
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="time"
//           label={{ value: "ثانیه", position: "insideBottomRight", offset: -5 }}
//           type="number"
//           domain={xDomain}
//         />
//         <YAxis
//           domain={yDomain}
//           label={{ value: selectedParam, angle: -90, position: "insideLeft" }}
//         />
//         <Tooltip />
//         <Legend />
//         <Line
//           type="monotone"
//           dataKey={selectedParam}
//           stroke="#8884d8"
//           strokeWidth={2}
//         />
//       </LineChart>
//     </div>
//   );
// };

// export default Linechart;


/////////////////////////////////////////

////Scatterchart
import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";

const ScatterPlot = () => {
  const [data, setData] = useState([]);
  const [selectedParam, setSelectedParam] = useState("efficiency");
  const [yDomain, setYDomain] = useState([0, 100]);
  const [xDomain, setXDomain] = useState([0, 100]);
  const [allParams, setAllParams] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/get_all_data").then((res) => {
      const receivedData = res.data;

      if (receivedData.length === 0) return;

      const excludedKeys = ["status", "timestamp", "id","time"];
      const startTime = new Date(receivedData[0].timestamp).getTime();

      const transformed = receivedData.map((item) => {
        const currentTime = new Date(item.timestamp).getTime();
        const secondsElapsed = Math.floor((currentTime - startTime) / 1000);
        return {
          time: secondsElapsed,
          ...item,
        };
      });

      setData(transformed);

      const keys = Object.keys(transformed[0]).filter((k) => !excludedKeys.includes(k));
      setAllParams(keys);

      const maxTime = Math.max(...transformed.map((d) => d.time));
      setXDomain([0, Math.max(100, maxTime)]);
    });
  }, []);

  useEffect(() => {
    if (data.length > 0 && selectedParam) {
      const values = data.map((d) => d[selectedParam]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      let margin = 0;
      if (range > 1) {
        const marginRatio = 0.1;
        margin = Math.max(range * marginRatio, 5);
      }

      const adjustedMin = Math.floor(min - margin);
      const adjustedMax = Math.ceil(max + margin);
      setYDomain([adjustedMin, adjustedMax]);
    }
  }, [selectedParam, data]);

  return (
    <div className="p-4 rounded-xl shadow bg-white w-[640px]">
      <div dir="rtl">
        <h2 className="text-xl font-semibold mb-2">
          نمودار تغییرات:
          <span> {selectedParam}</span>
        </h2>
        <div className="mb-4">
          <label className="mr-2 ">پارامتر مورد نظر را انتخاب کنید: </label>
          <select
            className="border px-2 py-1 rounded text-left"
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value)}
          >
            {allParams.map((param) => (
              <option key={param} value={param}>
                {param}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScatterChart
        width={600}
        height={350}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="time"
          domain={xDomain}
          name="زمان"
          label={{ value: "ثانیه", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey={selectedParam}
          domain={yDomain}
          name={selectedParam}
          label={{ value: selectedParam, angle: -90, position: "insideLeft" }}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter
          name={selectedParam}
          data={data}
          fill="#8884d8"
        />
      </ScatterChart>
    </div>
  );
};

export default ScatterPlot;

