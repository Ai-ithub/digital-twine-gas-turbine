import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { week: 'Week 1', performance: 80, vibration: 20 },
  { week: 'Week 2', performance: 90, vibration: 30 },
  { week: 'Week 3', performance: 85, vibration: 25 },
  { week: 'Week 4', performance: 100, vibration: 35 },
];

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>نمودار عملکرد و ارتعاش</h2>
      <LineChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="performance" stroke="#8884d8" />
        <Line type="monotone" dataKey="vibration" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}

export default App;
