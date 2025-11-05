import Card from '../shared/Card';
import CategoryFilter from '../shared/CategoryFilter';
import DateRangePicker from '../shared/DateRangePicker';

export default function GastosFilters({
  categories,
  selectedCategoryIds,
  toggleCategoryFilter,
  startDate,
  endDate,
  updateDates,
  totalSpent
}) {
  return (
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
  );
}
