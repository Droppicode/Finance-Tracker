import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Card from '../shared/Card';

const COLORS_INVESTMENTS = ['#3b82f6', '#14b8a6', '#6366f1', '#22c55e', '#818cf8', '#06b6d4', '#a3e635'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Valor: {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function PortfolioChartCard({ chartData, totalInvested }) {
  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Carteira</h2>
        <div className="text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Investido</span>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">
            {totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_INVESTMENTS[index % COLORS_INVESTMENTS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
