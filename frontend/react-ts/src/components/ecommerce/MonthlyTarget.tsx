import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
 

export default function MonthlyTarget() {
  
  const [data, setData] = useState<any[]>([]);
  const [temperatureArray, setTemperatureArray] = useState<number[]>([]);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
// افزایش عدد

console.log(data,index);


useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await fetch("http://localhost:5000/get_all_data");
          if (!response.ok) {
              throw new Error("❌ مشکل در دریافت داده");
          }
          const result = await response.json();
          setData(result);

          // استخراج `Temperature_In` از داده‌ها و ذخیره در آرایه
          const tempArray = result.map((item: any) => item.Temperature_In);
          setTemperatureArray(tempArray);


          if (tempArray.length > 0) {
            setCurrentTemp(tempArray[0]);
        }

      } catch (error) {
          console.error(error);
      }
  };

  fetchData();
}, []);

 

useEffect(() => {
  if (temperatureArray.length === 0) return;

  const interval = setInterval(() => {
      setIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % temperatureArray.length;
          setCurrentTemp(temperatureArray[newIndex]); // مقدار دما را بروزرسانی می‌کند
          return newIndex;
      });
  }, 1000); // هر 1 ثانیه مقدار تغییر کند

  return () => clearInterval(interval); // پاک کردن تایمر هنگام خروج از کامپوننت
}, [temperatureArray]);
 
 



console.log(currentTemp);

  


 
 
    
const series = [currentTemp !== null ? currentTemp : 0];

  

    const [model, setModel] = useState("normal");
    const [mcolor, setCmodel] = useState("#009432");

   
    useEffect(() => {
  
  
      if (!series[0]) series[0]=0;
    
      if (series[0]>35 && series[0]<65) {
    setModel("warning");
    setCmodel("#C4E538");
    
    
  }else if (series[0]>65 && series[0]<100) {
 
    setModel("danger");
    setCmodel("#EA2027")
  }
    }, [model , mcolor]);
 


    


  const options: ApexOptions = {
    colors: [mcolor],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 380 ,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "65%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "24px",
            fontWeight: "200",
            offsetY: -40,
            color: mcolor,
            formatter: function (val) {
              return val + " C";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [mcolor],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };
  
 // بررسی اگر `data` یک Object است، تبدیل به آرایه کنیم


 // استخراج مقدار `Temperature_In` از هر آیتم
 
 
  return (
    
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
 
        <div className="relative ">
        <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        Temperature in
 

      
      </div>
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {model}
          </span>
        </div>
 
      </div>


    </div>
  );
}
