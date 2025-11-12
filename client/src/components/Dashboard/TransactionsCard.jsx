import { useMemo, useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import CategoryManager from './CategoryManager';
import CategoryFilter from '../shared/CategoryFilter';
import DateRangePicker from '../shared/DateRangePicker';
import EditableTableCell from './EditableTableCell';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import TransactionListItem from './TransactionListItem';
import FilterButton from '../shared/FilterButton';
import FilterModal from '../shared/FilterModal';

export default function TransactionsCard({
  transactions,
  categories,
  deleteTransaction,
  updateTransactionCategory,
  updateTransactionDetails,
  addCategory,
  removeCategory,
  selectedCategoryIds,
  onCategoryFilterChange,
  startDate,
  endDate,
  updateDates
}) {
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categoryOptions = useMemo(() => 
    (categories || []).map(c => ({ value: c.id, label: c.name })),
    [categories]
  );

  const handleCategoryChange = async (id, newCategoryId) => {
    await updateTransactionCategory(id, newCategoryId);
    setEditingCategoryId(null);
  };

  const toggleCategoryEditor = (id) => {
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
    } else {
      setEditingCategoryId(id);
    }
  };

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transactions.slice(startIndex, endIndex);
  }, [transactions, currentPage]);

    return (

      <Card>

                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">

                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Transações</h2>

                  {/* Filters for large screens */}

                  <div className="hidden md:flex flex-wrap items-center gap-4">

                    <CategoryFilter
                      options={categoryOptions}
                      selectedItems={selectedCategoryIds}
                      onChange={onCategoryFilterChange}
                      filterName="Categorias"
                    />

                    <DateRangePicker

                      startDate={startDate}

                      endDate={endDate}

                      onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}

                      onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}

                    />

                  </div>

                  {/* Filter button for small screens */}

                  <FilterButton onClick={() => setIsFilterModalOpen(true)} className="md:hidden" />

                </div>

  

        {/* Desktop Table View */}

        <div className="overflow-x-auto hidden md:block">

          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

            <thead className="bg-gray-50 dark:bg-gray-700">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instituição</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor (R$)</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>

              </tr>

            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

              {paginatedTransactions.map((t) => (

                <tr key={t.id}>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.date}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">

                    <EditableTableCell value={t.description} onSave={(newValue) => updateTransactionDetails(t.id, { description: newValue })} />

                  </td>

                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>

                    <EditableTableCell

                      value={t.amount}

                      onSave={(newValue) => updateTransactionDetails(t.id, { amount: newValue })}

                      cellType="number"

                      transactionType={t.type}

                      onTypeChange={(newType) => updateTransactionDetails(t.id, { type: newType })}

                    />

                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm relative" style={{ minWidth: '200px' }}>

                    <div

                      onClick={() => toggleCategoryEditor(t.id)}

                      className="flex items-center justify-between cursor-pointer p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"

                    >

                      <span>{t.category?.name || 'Selecione uma categoria...'}</span>

                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />

                    </div>

                    {editingCategoryId === t.id && categories && (

                      <CategoryManager

                        categories={categoryOptions}

                        onSelectCategory={(category) => handleCategoryChange(t.id, category)}

                        onAddCategory={addCategory}

                        onRemoveCategory={removeCategory}

                      />

                    )}

                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">

                    <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">

                      <Trash2 className="w-5 h-5" />

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

  

        {/* Mobile List View */}

        <div className="md:hidden">

          {paginatedTransactions.map((t) => (

            <TransactionListItem

              key={t.id}

              transaction={t}

              categories={categories}

              deleteTransaction={deleteTransaction}

              updateTransactionCategory={updateTransactionCategory}

              updateTransactionDetails={updateTransactionDetails}

              addCategory={addCategory}

              removeCategory={removeCategory}

            />

          ))}

        </div>

  

        {transactions.length > itemsPerPage && (

          <div className="flex justify-center items-center mt-4">

            <Button

              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}

              disabled={currentPage === 1}

              variant="ghost"

              size="icon"

            >

              <ChevronLeft className="w-5 h-5" />

            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-300 mx-4">

              Página {currentPage} de {Math.ceil(transactions.length / itemsPerPage)}

            </span>

            <Button

              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(transactions.length / itemsPerPage)))}            disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}

              variant="ghost"

              size="icon"

            >

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        )}

                        <FilterModal

                          isOpen={isFilterModalOpen}

                          onClose={() => setIsFilterModalOpen(false)}

                          title="Filtros de Transações"

                          allCategories={categories}

                          selectedCategoryIds={selectedCategoryIds}

                          onCategoryFilterChange={onCategoryFilterChange}

                          filterName="Categorias"

                          startDate={startDate}

                          endDate={endDate}

                          onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}

                          onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
                        />

          </Card>

        );
}
