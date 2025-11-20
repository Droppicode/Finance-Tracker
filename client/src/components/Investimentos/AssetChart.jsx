import { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import Button from '../shared/Button';
import { getHistoricalData } from '../../api/historicalData';

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
    const [allData, setAllData] = useState([]); // All historical data
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Carregando gráfico...');
    const [error, setError] = useState(null);
    const [range, setRange] = useState('1mo'); // Default range
    const [currentSymbol, setCurrentSymbol] = useState(null);

    // Range configurations
    const rangeConfigs = {
        '1w': { label: '1S', days: 7 },
        '2w': { label: '2S', days: 14 },
        '1mo': { label: '1M', days: 30 },
        '3mo': { label: '3M', days: 90 },
        '6mo': { label: '6M', days: 180 },
        '1y': { label: '1A', days: 365 },
        'max': { label: 'Máx', days: null },
    };

    // Clear cache when symbol changes
    useEffect(() => {
        if (symbol !== currentSymbol) {
            setAllData([]);
            setError(null);
            setCurrentSymbol(symbol);
        }
    }, [symbol, currentSymbol]);

    // Fetch all historical data (max range) once per symbol
    const fetchAllData = async () => {
        if (!symbol) return;

        setLoading(true);
        setError(null);
        setLoadingMessage('Buscando dados históricos...');

        try {
            // Get all data from Firestore (or trigger GitHub Actions if needed)
            const firestoreData = await getHistoricalData(symbol);

            console.log(`Fetched all historical data for ${symbol}:`, firestoreData);

            // Format data for the chart
            const formatData = (data) => {
                if (!data || !data.data || data.data.length === 0) {
                    return [];
                }

                return data.data.map(item => ({
                    timestamp: item.date,
                    date: new Date(item.date * 1000).toLocaleDateString('pt-BR'),
                    price: item.close,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    volume: item.volume,
                }));
            };

            const formattedData = formatData(firestoreData);
            setAllData(formattedData);

        } catch (error) {
            console.error(`Erro ao buscar dados:`, error);
            setError(error.message || 'Erro ao carregar dados históricos');
        } finally {
            setLoading(false);
            setLoadingMessage('Carregando gráfico...');
        }
    };

    // Load data on mount or when symbol changes
    useEffect(() => {
        if (symbol && allData.length === 0 && !loading && !error) {
            fetchAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]);

    // Filter data based on selected range (client-side)
    const displayData = useMemo(() => {
        if (!allData || allData.length === 0) return [];

        const config = rangeConfigs[range];

        // If 'max', show all data
        if (!config.days) return allData;

        // Filter by days
        const now = Date.now();
        const cutoffTime = now - (config.days * 24 * 60 * 60 * 1000);

        return allData.filter(d => (d.timestamp * 1000) >= cutoffTime);
    }, [allData, range]);

    const ranges = Object.entries(rangeConfigs).map(([value, config]) => ({
        value,
        label: config.label
    }));

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {ranges.map(r => (
                    <Button
                        key={r.value}
                        variant={range === r.value ? 'primary' : 'secondary'}
                        onClick={() => setRange(r.value)}
                        className="px-3 py-1 text-xs"
                        disabled={loading}
                    >
                        {r.label}
                    </Button>
                ))}
            </div>
            <div className="grow w-full">
                {loading && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        {loadingMessage}
                    </p>
                )}
                {!loading && error && (
                    <div className="text-center">
                        <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                        <Button
                            variant="secondary"
                            onClick={() => fetchAllData()}
                            className="px-4 py-2 text-sm"
                        >
                            Tentar novamente
                        </Button>
                    </div>
                )}
                {!loading && !error && (!displayData || displayData.length === 0) && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        Não há dados para exibir o gráfico.
                    </p>
                )}
                {!loading && !error && displayData && displayData.length > 0 && (
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
