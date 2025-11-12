import { useMemo, useState } from 'react';
import Header from '../components/shared/Header';
import SpendingChartCard from '../components/Gastos/SpendingChartCard';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';
import Card from '../components/shared/Card';
import CategoryFilter from '../components/shared/CategoryFilter';
import DateRangePicker from '../components/shared/DateRangePicker';
import FilterButton from '../components/shared/FilterButton';
import FilterModal from '../components/shared/FilterModal';

export default function GastosPage() {
  const {
    transactions,
    loading,
    categories,
    selectedCategoryIds,
    onCategoryFilterChange,
  } = useTransactions();

  const { startDate, endDate, updateDates } = useUtils();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categoryOptions = useMemo(() =>
    (categories || []).map(c => ({ value: c.id, label: c.name })),
    [categories]
  );

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

      {/* Filters for larger screens */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Filtrar por Categoria</h3>
          <CategoryFilter
            options={categoryOptions}
            selectedItems={selectedCategoryIds}
            onChange={onCategoryFilterChange}
            filterName="Categorias"
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

      {/* Filters for small screens */}
      <div className="md:hidden mb-6">
        <Card className="bg-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-indigo-200">Total Gasto</h3>
              <p className="text-2xl font-bold">
                {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <FilterButton onClick={() => setIsFilterModalOpen(true)} />
          </div>
        </Card>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Gastos"
        allCategories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryFilterChange={onCategoryFilterChange}
        filterName="Categorias"
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}
        onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
      />

      <SpendingChartCard spendingData={spendingData} />
    </div>
  );
}