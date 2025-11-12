import { useMemo } from 'react';
import Header from '../components/shared/Header';
import SpendingChartCard from '../components/Gastos/SpendingChartCard';
import GastosFilters from '../components/Gastos/GastosFilters';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';

export default function GastosPage() {
  const { 
    transactions, 
    loading, 
    categories,
    selectedCategoryIds,
    onCategoryFilterChange 
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
      
      <GastosFilters
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryFilterChange={onCategoryFilterChange}
        startDate={startDate}
        endDate={endDate}
        updateDates={updateDates}
        totalSpent={totalSpent}
      />

      <SpendingChartCard spendingData={spendingData} />
    </div>
  );
}