import { useState, useEffect } from 'react';
import {
  AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import axiosInstance from '../api/axios';
import Button from './Button';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Preço: {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    );
  }
  return null;
};

const AssetChart = ({ symbol }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('3mo'); // Default range

  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/investments/quote/?symbol=${symbol}&range=${range}&interval=1d`);
        // A API do Brapi retorna os dados em `historicalDataPrice`
        const chartData = response.data.historicalDataPrice.map(item => ({
          date: new Date(item.date * 1000).toLocaleDateString('pt-BR'),
          price: item.close,
        }));
        setData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, range]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  const ranges = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1A' },
    { value: '5y', label: '5A' },
    { value: 'max', label: 'Máx' },
  ];

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Não há dados para exibir o gráfico.</p>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-center gap-2 mb-4">
        {ranges.map(r => (
          <Button
            key={r.value}
            variant={range === r.value ? 'primary' : 'secondary'}
            onClick={() => handleRangeChange(r.value)}
            className="px-3 py-1 text-xs"
          >
            {r.label}
          </Button>
        ))}
      </div>
      <div className="grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis 
              domain={[dataMin => dataMin * 0.99, dataMax => dataMax * 1.01]}
              tickFormatter={(value) => value.toFixed(2)} 
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetChart;
