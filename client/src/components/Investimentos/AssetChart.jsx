import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import Button from '../shared/Button';
import { getQuote } from '../../api/brapi';

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
  const [chartData, setChartData] = useState([]);
  const [longTermData, setLongTermData] = useState({ symbol: null, data: [] });
  const [shortTermData, setShortTermData] = useState({ symbol: null, data: [] });
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('1mo'); // Default range

  useEffect(() => {
    const fetchAllData = async () => {
      if (!symbol) return;

      // Clear old data when symbol changes
      if (symbol !== longTermData.symbol) {
        setLongTermData({ symbol: null, data: [] });
        setShortTermData({ symbol: null, data: [] });
        setChartData([]);
      }

      setLoading(true);
      try {
        // Re-fetching all data, including long-term ('max') and short-term ('5d')
        const [longTermRes, shortTermRes] = await Promise.all([
          getQuote(symbol, 'max', '1d'),
          getQuote(symbol, '5d', '1h')
        ]);

        // Debug: Log the data received from the API
        console.log('Long term response:', longTermRes);
        console.log('Short term response:', shortTermRes);

        const formatData = (res) => (res && res.historicalDataPrice
          ? res.historicalDataPrice.map(item => ({
            timestamp: item.date,
            date: new Date(item.date * 1000).toLocaleDateString('pt-BR'),
            price: item.close,
          }))
          : []
        );

        setLongTermData({ symbol, data: formatData(longTermRes) });
        setShortTermData({ symbol, data: formatData(shortTermRes) });

      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        setLongTermData({ symbol, data: [] });
        setShortTermData({ symbol, data: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [symbol, longTermData.symbol]);

  useEffect(() => {
    const filterData = () => {
      const now = new Date();
      let startDate = new Date();
      let sourceData = [];
      let timeFormat = {};

      if (range === '1d' || range === '5d') {
        sourceData = shortTermData.data;
        const oneDayMillis = 24 * 60 * 60 * 1000;
        const fiveDaysMillis = 5 * oneDayMillis;
        
        if (range === '1d') {
            const yesterday = now.getTime() - oneDayMillis;
            sourceData = sourceData.filter(d => (d.timestamp * 1000) >= yesterday);
        } else { // 5d
            const fiveDaysAgo = now.getTime() - fiveDaysMillis;
            sourceData = sourceData.filter(d => (d.timestamp * 1000) >= fiveDaysAgo);
        }
        timeFormat = { hour: '2-digit', minute: '2-digit' };

      } else {
        sourceData = longTermData.data;
        switch (range) {
          case '1mo':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3mo':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6mo':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case '5y':
            startDate.setFullYear(now.getFullYear() - 5);
            break;
          case 'max':
            setChartData(sourceData);
            return;
          default:
            break;
        }
        sourceData = sourceData.filter(d => (d.timestamp * 1000) >= startDate.getTime());
      }
      
      const formattedData = sourceData.map(d => ({
        ...d,
        date: new Date(d.timestamp * 1000).toLocaleDateString('pt-BR', timeFormat)
      }));

      setChartData(formattedData);
    };

    if ((range === '1d' || range === '5d') && shortTermData.data.length > 0) {
        filterData();
    } else if (longTermData.data.length > 0) {
        filterData();
    }

  }, [range, longTermData, shortTermData]);


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

  const displayData = useMemo(() => chartData, [chartData]);

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
        {loading && <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p>}
        {!loading && (!displayData || displayData.length === 0) && (
          <p className="text-center text-gray-500 dark:text-gray-400">Não há dados para exibir o gráfico.</p>
        )}
        {!loading && displayData && displayData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis 
                domain={[dataMin => dataMin * 0.99, dataMax => dataMax * 1.01]}
                tickFormatter={(value) => value.toFixed(2)} 
                tick={{ fontSize: 10 }}
                width={40}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="linear" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AssetChart;
