import Linechart from './components/Linechart';
import Ganttchart from './components/Ganttchart';
//import VibrationHeatmap from './components/VibrationHeatmap';

function App() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-5 text-blue-600 text-center">داشبورد کمپرسور</h1>
      <section className='p-5 bg-blue-500 flex justify-between flex-wrap gap-4 '>
        <div className="bg-white rounded-xl p-4 shadow-md w-full md:w-[48%]">
          <Linechart />
        </div>
        <div className="bg-white rounded-xl  w-full md:w-[48%]">
          <Ganttchart />
        </div>
        {/* <div className="bg-white rounded-xl  w-full md:w-[48%]">
          <VibrationHeatmap />
        </div> */}
      </section>
    </div>
  );
}

export default App;




