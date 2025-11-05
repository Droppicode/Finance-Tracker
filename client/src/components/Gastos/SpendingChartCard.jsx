import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import Card from '../shared/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Gasto: {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    );
  }
  return null;
};

export default function SpendingChartCard({ spendingData }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Gastos por Categoria</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={spendingData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60619c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#60619c" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="rgb(107 114 128)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgb(107 114 128)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <Bar dataKey="value" name="Gasto" fill="url(#colorValue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
