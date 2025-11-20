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
    // Cache data for each range to avoid refetching
    const [rangeDataCache, setRangeDataCache] = useState({});
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('1mo'); // Default range
    const [currentSymbol, setCurrentSymbol] = useState(null);

    // Range configurations with their API parameters
    const rangeConfigs = {
        '1w': { apiRange: '1mo', interval: '1d', label: '1S' },
        '2w': { apiRange: '1mo', interval: '1d', label: '2S' },
        '1mo': { apiRange: '1mo', interval: '1d', label: '1M' },
        '3mo': { apiRange: '3mo', interval: '1d', label: '3M' },
    };

    // Clear cache when symbol changes
    useEffect(() => {
        if (symbol !== currentSymbol) {
            setRangeDataCache({});
            setChartData([]);
            setCurrentSymbol(symbol);
        }
    }, [symbol, currentSymbol]);

    // Fetch data for a specific range
    const fetchRangeData = async (rangeKey) => {
        if (!symbol) return;

        // Check if we already have data for this range
        const cacheKey = `${symbol} -${rangeKey} `;
        if (rangeDataCache[cacheKey]) {
            console.log(`Using cached data for ${rangeKey}`);
            return rangeDataCache[cacheKey];
        }

        setLoading(true);
        try {
            const config = rangeConfigs[rangeKey];
            const res = await getQuote(symbol, config.apiRange, config.interval);

            console.log(`Fetched data for range ${rangeKey}: `, res);

            const formatData = (res) => (res && res.historicalDataPrice
                ? res.historicalDataPrice.map(item => ({
                    timestamp: item.date,
                    date: new Date(item.date * 1000).toLocaleDateString('pt-BR'),
                    price: item.close,
                }))
                : []
            );

            const formattedData = formatData(res);

            // Cache the data
            setRangeDataCache(prev => ({
                ...prev,
                [cacheKey]: formattedData
            }));

            return formattedData;

        } catch (error) {
            console.error(`Erro ao buscar dados para ${rangeKey}: `, error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Handle range change - fetch data and filter
    const handleRangeChange = async (newRange) => {
        setRange(newRange);

        const data = await fetchRangeData(newRange);

        // Filter data based on the selected range
        const filterData = (sourceData) => {
            if (!sourceData || sourceData.length === 0) return [];

            const now = new Date();
            let startDate = new Date();

            switch (newRange) {
                case '1w':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '2w':
                    startDate.setDate(now.getDate() - 14);
                    break;
                case '1mo':
                case '3mo':
                case '6mo':
                case '1y':
                case 'max':
                    // Show all data from API response
                    return sourceData;
                default:
                    return sourceData;
            }

            return sourceData.filter(d => (d.timestamp * 1000) >= startDate.getTime());
        };

        setChartData(filterData(data));
    };

    // Load default range on mount
    useEffect(() => {
        if (symbol && !chartData.length) {
            handleRangeChange(range);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]);

    const ranges = Object.entries(rangeConfigs).map(([value, config]) => ({
        value,
        label: config.label
    }));

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
                        disabled={loading}
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
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
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
