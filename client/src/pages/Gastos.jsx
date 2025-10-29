import { useMemo } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import { useTransactions } from '../context/TransactionContext';
import CategoryFilter from '../components/CategoryFilter';

// Importando componentes de gráficos da biblioteca recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Helper to get date strings in YYYY-MM-DD format
const toYYYYMMDD = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export default function GastosPage() {
  const { 
    transactions, 
    loading, 
    startDate, 
    endDate, 
    setDateRange, 
    categories,
    selectedCategoryIds,
    toggleCategoryFilter 
  } = useTransactions();

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
            <div className="flex items-center space-x-2">
                <input 
                    type="date" 
                    value={toYYYYMMDD(startDate)}
                    onChange={(e) => setDateRange(new Date(e.target.value), endDate)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <span className="text-gray-500">até</span>
                <input 
                    type="date" 
                    value={toYYYYMMDD(endDate)}
                    onChange={(e) => setDateRange(startDate, new Date(e.target.value))}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
            </div>
        </Card>
        <Card className="bg-blue-600 text-white">
          <h3 className="text-sm font-medium text-blue-200">Total Gasto (Período)</h3>
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
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$${value}`} />
              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                }
              />
              <Legend wrapperStyle={{ color: 'var(--legend-text, #374151)' }} className="dark:[--legend-text:#d1d5db]" />
              <Bar dataKey="value" name="Gasto" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}