import { useMemo } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';
import CategoryFilter from '../components/CategoryFilter';
import DateRangePicker from '../components/DateRangePicker';

// Importando componentes de gráficos da biblioteca recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

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

export default function GastosPage() {
  const { 
    transactions, 
    loading, 
    categories,
    selectedCategoryIds,
    toggleCategoryFilter 
  } = useTransactions();

  const { startDate, endDate, updateDates } = useUtils();

  const spendingData = useMemo(() => {
    if (!transactions) return [];

    const spendingByCategory = transactions
      .filter(t => t.type === 'debit' && t.category)
      .reduce((acc, transaction) => {
        const categoryName = transaction.category.name;
        const amount = Number(transaction.amount);
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += amount;
        return acc;
      }, {});

    return Object.entries(spendingByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const totalSpent = useMemo(() => {
    return spendingData.reduce((acc, item) => acc + item.value, 0);
  }, [spendingData]);

  if (loading) {
    return <p>Carregando dados de gastos...</p>;
  }

  return (
    <div>
      <Header title="Análise de Gastos" />
      
      {/* Seção de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Filtrar por Categoria</h3>
          <CategoryFilter 
            allCategories={categories}
            selectedIds={selectedCategoryIds}
            onToggleCategory={toggleCategoryFilter}
          />
        </Card>
        <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Filtrar por Data</h3>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}
              onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
            />
        </Card>
        <Card className="bg-indigo-600 text-white">
          <h3 className="text-sm font-medium text-indigo-200">Total Gasto (Período)</h3>
          <p className="text-3xl font-bold">
            {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </Card>
      </div>

      {/* Seção do Gráfico */}
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
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6066cd" stopOpacity={0.8}/>
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
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <Bar dataKey="value" name="Gasto" fill="url(#colorValue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}