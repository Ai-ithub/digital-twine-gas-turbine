import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
 

export default function StatisticsChart() {

    const [data, setData] = useState<any[]>([]);
    const [vibrat, setVibrat] = useState<number[]>([]);
    // const [currentTemp, setCurrentTemp] = useState<number | null>(null);
    // const [index, setIndex] = useState(0);

//گرفتن داده
useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await fetch("http://192.168.37.122:5000/dart_predictions");
          if (!response.ok) {
              throw new Error("❌ مشکل در دریافت داده");
          }
          const result = await response.json();
          setData(result);
         
          // استخراج `Temperature_In` از داده‌ها و ذخیره در آرایه
          const tempArray =  result["Dart Predictions"].map((item: any) => item["Predicted Value"]);
          setVibrat(tempArray)
         
          
          // setTemperatureArray(tempArray);


        //   if (tempArray.length > 0) {
        //     setCurrentTemp(tempArray[0]);
        // }

      } catch (error) {
          console.error(error);
      }
  };

  fetchData();
}, []);

const [visibleData, setVisibleData] = useState<number[]>(
  vibrat.slice(0, 10).map(num => parseFloat(num.toFixed(2))) // گرد کردن اعداد اولیه
);
 console.log(visibleData);
 
useEffect(() => {
  let currentIndex = 0;

  const interval = setInterval(() => {
    if (currentIndex + 10 >= vibrat.length) {
      clearInterval(interval);
      return;
    }

    currentIndex += 1;
    setVisibleData(
      vibrat.slice(currentIndex, currentIndex + 61).map(num => parseFloat(num.toFixed(2))) // گرد کردن مقادیر جدید
    );
  }, 1000);

  return () => clearInterval(interval);
}, [vibrat]);

// useEffect(() => {
//   if (temperatureArray.length === 0) return;

//   const interval = setInterval(() => {
//       setIndex((prevIndex) => {
//           const newIndex = (prevIndex + 1) % temperatureArray.length;
//           setCurrentTemp(temperatureArray[newIndex]); // مقدار دما را بروزرسانی می‌کند
//           return newIndex;
//       });
//   }, 1000); // هر 1 ثانیه مقدار تغییر کند

//   return () => clearInterval(interval); // پاک کردن تایمر هنگام خروج از کامپوننت
// }, [temperatureArray]);
 
 
 
 


const options: ApexOptions = {
  legend: {
    show: true,
    horizontalAlign: "left",
  },
  colors: ["#465FFF", "#9CB9FF"],
  chart: {
    fontFamily: "Outfit, sans-serif",
    height: 400,
    type: "line",
    toolbar: {
      show: true, // نمایش یا عدم نمایش Toolbar
      tools: {
        download: true,  // امکان دانلود تصویر
        selection: true, // انتخاب داده‌ها
        zoom: false,       // زوم کردن روی داده‌ها
        zoomin: true,     // دکمه‌ی بزرگ‌نمایی
        zoomout: true,    // دکمه‌ی کوچک‌نمایی
        pan: false,       // حرکت در نمودار
        reset: false,      // دکمه‌ی ریست زوم
      },
    },
  },
  stroke: {
    curve: "straight",
    width: [1, 1],
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  },
  markers: {
    size: 0,
    strokeColors: "#fff",
    strokeWidth: 2,
    hover: {
      size: 6,
    },
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: true,
    x: {
      format: "dd MMM yyyy",
    },
  },
  xaxis: {
    type: "category",
    categories: [],
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    labels: {
      style: {
        fontSize: "12px",
        colors: ["#6B7280"],
      },
      formatter: (value) => value.toFixed(2), // 🔹 نمایش فقط ۱ رقم صحیح و ۲ رقم اعشار
    },
    title: {
      text: "",
      style: {
        fontSize: "0px",
      },
    },
  },
};

 

  const series = [
    {
      name: "vivrat",
      data: visibleData,
    },
    {
      name: "B",
      data:[],
    },
  ];



  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Vibrations
          </h3>
 
        </div>
 
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={180} />
        </div>
      </div>
    </div>
  );
}
