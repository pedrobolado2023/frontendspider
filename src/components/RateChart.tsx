import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RateData {
  date: string;
  [key: string]: string | number;
}

interface ChartProps {
  data: RateData[];
  hotelNames: string[];
}

const RateChart = ({ data, hotelNames }: ChartProps) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-[32px] border border-slate-700/50 p-8 shadow-2xl h-[500px]">
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Tendência de Tarifas</h3>
        <p className="text-slate-400 text-sm">Evolução dos preços nos últimos 30 dias</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          {hotelNames.map((name, i) => (
            <Line 
              key={name}
              type="monotone" 
              dataKey={name} 
              stroke={colors[i % colors.length]} 
              strokeWidth={3}
              dot={{ r: 4, fill: colors[i % colors.length] }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RateChart;
