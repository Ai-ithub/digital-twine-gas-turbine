import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import jalaali from "jalaali-js";
import dayjs from "dayjs";
import jalaliday from "jalaliday";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const GanttChart = () => {
  const [data, setData] = useState([]);
  dayjs.extend(jalaliday);

  useEffect(() => {
    async function fetchData() {
      try {
        const csvResponse = await fetch("/data/data.csv");
        const csvText = await csvResponse.text();
        const parsedCSV = Papa.parse(csvText, { header: true }).data;

        const apiResponse = await axios.get(
          "http://localhost:5000/get_all_data"
        );
        const allData = apiResponse.data;
        const maintenance_quality =
          allData[allData.length - 1]?.maintenance_quality || 100;

        const groupStandardInterval = {
          11: 1000, //Filters
          22: 4320, // Moving_Part
          33: 26280, // Other_components
        };

        const result = parsedCSV
          .filter(
            (row) => row.part_id && row.last_replacement && row.group_code
          )
          .map((row) => {
            const group = parseInt(row.group_code);
            const part_id = row.part_id;
            const lastReplacement = dayjs(row.last_replacement); 
          
            const standardInterval = groupStandardInterval[group] || 0;
            const replacementIntervalHours =
              standardInterval * (maintenance_quality / 100);
            const replacementIntervalDays = replacementIntervalHours / 24;
          
            const nextReplacement = lastReplacement.add(replacementIntervalDays, "day");
          
            const today = dayjs().calendar("jalali").startOf("day");
            const startDate = lastReplacement.calendar("jalali").startOf("day");
            const endDate = nextReplacement.calendar("jalali").startOf("day");
          
            const diffWithStart = Math.abs(startDate.diff(today, "day"));
            const diffWithEnd = Math.max(0, endDate.diff(today, "day"));
            const duration = Math.round(replacementIntervalDays);
          
            return {
              part_id,
              start: startDate.format("YYYY-MM-DD"),
              end: endDate.format("YYYY-MM-DD"),
              diffWithStart,
              diffWithEnd,
              duration,
              nextReplacement: endDate.format("YYYY-MM-DD"),
            };
          });
          

        setData(result);
      } catch (error) {
        console.error("❌ خطا در دریافت یا پردازش داده‌ها:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full h-full p-4">
      <h2 className="text-xl font-bold mb-4 text-center">
        نمودار گانت زمان تعویض قطعات
      </h2>
      <ResponsiveContainer width="95%" height={100 * data.length}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 5, left: 85, bottom: 20 }}
        >
          <XAxis type="number" unit=" روز" />
          <YAxis type="category" dataKey="part_id" />
          <Tooltip
            formatter={(value) => `${value} روز`}
            labelFormatter={(label) => `قطعه: ${label}`}
          />
          <Bar
            dataKey="diffWithStart"
            stackId="a"
            fill="#82ca9d"
            name="تعداد روز کارکرد فعلی"
            position="insideLeft"
          />
          <Bar
            dataKey="diffWithEnd"
            stackId="a"
            fill="#8884d8"
            name="تعداد روز باقی‌مانده عمر"
            position="insideRight"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">تاریخ‌های تخمینی تعویض بعدی:</h3>
        <ul className="list-disc pl-5 text-sm">
          {data.map((item) => (
            <li key={item.part_id}>
              {item.part_id}: {item.nextReplacement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GanttChart;

///////////01/////////////
// import React, { useEffect, useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// // تابع برای تبدیل تاریخ جلالی به تاریخ شمسی (نمایشی)
// function jalaliToPersian(dateStr) {
//   return dateStr.replace(/\//g, '-');
// }

// const Ganttchart = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     // فرض: داده‌ها از API گرفته می‌شن اما اینجا هاردکد می‌کنیم
//     const fetched = [
//       {
//         name: 'Bearing01',
//         lastReplacement: '1400/01/01',
//         expectedLife: 2880,
//         currentUsage: 1000,
//         nextReplacement: '1402/06/01', // فرضی از API
//       },
//       {
//         name: 'Seal01',
//         lastReplacement: '1400/01/01',
//         expectedLife: 8640,
//         currentUsage: 3000,
//         nextReplacement: '1404/03/15',
//       },
//       {
//         name: 'Impeller01',
//         lastReplacement: '1400/01/01',
//         expectedLife: 5760,
//         currentUsage: 2000,
//         nextReplacement: '1403/01/25',
//       },
//       {
//         name: 'Coupling01',
//         lastReplacement: '1400/01/01',
//         expectedLife: 11520,
//         currentUsage: 4000,
//         nextReplacement: '1405/07/30',
//       },
//     ];

//     // پردازش برای گانت چارت: هر قطعه باید یک میله با طول expectedLife و currentUsage باشد
//     const chartData = fetched.map((item) => ({
//       name: item.name,
//       currentUsage: item.currentUsage,
//       remainingLife: item.expectedLife - item.currentUsage,
//       nextReplacement: jalaliToPersian(item.nextReplacement),
//     }));

//     setData(chartData);
//   }, []);

//   return (
//     <div className="p-6 bg-white rounded-2xl shadow-md">
//       <h2 className="text-xl font-bold mb-4">نمودار گانت پیش بینی زمان تعویض قطعات کمپرسور</h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart
//           layout="vertical"
//           data={data}
//           margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis type="number" label={{ value: 'ساعت', position: 'insideBottomRight', offset: -5 }} />
//           <YAxis dataKey="name" type="category" />
//           <Tooltip formatter={(value) => `${value} ساعت`} />
//           <Bar dataKey="currentUsage" stackId="a" fill="#82ca9d" name="ساعات کارکرد فعلی" />
//           <Bar dataKey="remainingLife" stackId="a" fill="#8884d8" name="باقی‌مانده عمر" />
//         </BarChart>
//       </ResponsiveContainer>

// <div className="mt-4">
//   <h3 className="font-semibold mb-2">تاریخ‌های تخمینی تعویض بعدی:</h3>
//   <ul className="list-disc pl-5 text-sm">
//     {data.map((item) => (
//       <li key={item.name}>
//         {item.name}: {item.nextReplacement}
//       </li>
//     ))}
//   </ul>
// </div>
//     </div>
//   );
// };

// export default Ganttchart;

/////////////////////////////////////////
//کد برای اینکه تاریخ تعویض قطعه از API گرفته شود و
// بقیه ی اطلاعات از یک فایل CSV خوانده شود

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LabelList
// } from 'recharts';

// function Ganttchart() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     // گرفتن داده‌ها از دو API
//     const fetchData = async () => {
//       try {
//         const [componentsRes, replacementRes] = await Promise.all([
//           axios.get('http://localhost:5000/components'),
//           axios.get('http://localhost:5000/get_all_data')
//         ]);

//         const components = componentsRes.data;
//         const replacements = replacementRes.data;

//         // ترکیب داده‌ها
//         const merged = components.map(part => {
//           const match = replacements.find(p => p.name === part.name);
//           return {
//             ...part,
//             usage: parseInt(part.current_hours),
//             remaining: parseInt(part.expected_lifetime) - parseInt(part.current_hours),
//             nextReplacement: match ? match.nextReplacement : 'نامشخص'
//           };
//         });

//         setData(merged);
//       } catch (error) {
//         console.error('خطا در دریافت داده‌ها:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="mt-6">
//       <h2 className="text-xl font-semibold mb-4">نمودار گانت زمان تعویض قطعات</h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart
//           layout="vertical"
//           data={data}
//           margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
//         >
//           <XAxis type="number" />
//           <YAxis type="category" dataKey="name" />
//           <Tooltip
//             formatter={(value, name) =>
//               [`${value} ساعت`, name === 'usage' ? 'ساعت کار فعلی' : 'باقیمانده تا تعویض']
//             }
//             labelFormatter={(label) => `قطعه: ${label}`}
//           />
//           <Bar dataKey="usage" stackId="a" fill="#82ca9d">
//             <LabelList dataKey="nextReplacement" position="right" />
//           </Bar>
//           <Bar dataKey="remaining" stackId="a" fill="#ccc" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default Ganttchart;
