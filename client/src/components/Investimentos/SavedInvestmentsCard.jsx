import { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import ToggleSwitch from '../shared/ToggleSwitch';
import CategoryFilter from '../shared/CategoryFilter';
import DateRangePicker from '../shared/DateRangePicker';
import { Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import FilterButton from '../shared/FilterButton';
import FilterModal from '../shared/FilterModal';

export default function SavedInvestmentsCard({
  investments,
  removeInvestment,
  loading,
  investmentOptions,
  startDate,
  endDate,
  updateDates,
  labelFromType
}) {
  const [groupByAsset, setGroupByAsset] = useState(false);
  const [filterType, setFilterType] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleInvestmentClick = (id) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  const handleRemoveClick = (e, id) => {
    e.stopPropagation();
    removeInvestment(id);
  };

  const processedInvestments = useMemo(() => {
    let filtered = investments;

    if (filterType.length > 0) {
      filtered = filtered.filter(inv => filterType.includes(inv.type));
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(inv => new Date(inv.purchase_date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(inv => new Date(inv.purchase_date) <= end);
    }

    if (groupByAsset) {
      const groupedMap = {};
      filtered.forEach(inv => {
        if (!groupedMap[inv.symbol]) {
          groupedMap[inv.symbol] = {
            ...inv,
            quantity: 0,
            totalValue: 0,
            originalIds: [],
            purchase_date: inv.purchase_date,
          };
        }
        groupedMap[inv.symbol].quantity += parseFloat(inv.quantity);
        groupedMap[inv.symbol].totalValue += parseFloat(inv.quantity) * parseFloat(inv.price);
        groupedMap[inv.symbol].originalIds.push(inv.id);
      });

      return Object.values(groupedMap).map(groupedInv => ({
        ...groupedInv,
        price: groupedInv.totalValue / groupedInv.quantity,
        id: groupedInv.symbol,
      }));
    }

    return filtered;
  }, [investments, groupByAsset, filterType, startDate, endDate]);

  const paginatedInvestments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedInvestments.slice(startIndex, endIndex);
  }, [processedInvestments, currentPage]);

  return (
    <Card className="h-full lg:absolute lg:inset-0">
      <div className="h-full overflow-y-auto">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Investimentos</h3>
          {/* Filters for large screens */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <ToggleSwitch
              label="Agrupar por Ativo"
              checked={groupByAsset}
              onChange={(e) => setGroupByAsset(e.target.checked)}
            />
            <CategoryFilter
              options={investmentOptions}
              selectedItems={filterType}
              onChange={setFilterType}
              filterName="Tipo"
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
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        ) : processedInvestments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Nenhum investimento salvo ainda.</p>
        ) : (
          <div className="space-y-2 mt-4">
            {paginatedInvestments.map(inv => {
              const isExpanded = expandedId === inv.id;

              return (
                <div key={inv.id}>
                  {/* Mobile View: Clickable and Expandable */}
                  <div className="md:hidden">
                    <div
                      className="flex justify-between items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      onClick={() => handleInvestmentClick(inv.id)}
                    >
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-gray-800 dark:text-gray-100 truncate">{inv.symbol}</span>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {(inv.quantity * inv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-b-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{inv.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {parseFloat(inv.quantity).toFixed(2)} x {parseFloat(inv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            {inv.type && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Tipo: {labelFromType(inv.type)}
                              </p>
                            )}
                            {groupByAsset && inv.originalIds && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {inv.originalIds.length} {inv.originalIds.length > 1 ? 'compras' : 'compra'}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleRemoveClick(e, inv.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            aria-label="Remover investimento"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop View: Full details, not clickable */}
                  <div className="hidden md:flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-4 grow">
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{inv.symbol}</span>
                        {groupByAsset && inv.originalIds && (
                          <span className="ml-2 text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded-full">
                            {inv.originalIds.length} {inv.originalIds.length > 1 ? 'compras' : 'compra'}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">{inv.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {(inv.quantity * inv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {parseFloat(inv.quantity).toFixed(2)} x {parseFloat(inv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      {inv.type && (
                        <span className="text-xs w-24 text-center px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{labelFromType(inv.type)}</span>
                      )}
                      <button
                        onClick={(e) => handleRemoveClick(e, inv.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        aria-label="Remover compra"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {processedInvestments.length > itemsPerPage && (
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
              Página {currentPage} de {Math.ceil(processedInvestments.length / itemsPerPage)}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(processedInvestments.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(processedInvestments.length / itemsPerPage)}
              variant="ghost"
              size="icon"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Investimentos"
        allCategories={investmentOptions}
        selectedCategoryIds={filterType}
        onCategoryFilterChange={setFilterType}
        filterName="Tipo"
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}
        onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
        showGroupByAsset={true}
        groupByAssetState={groupByAsset}
        onGroupByAssetChange={(e) => setGroupByAsset(e.target.checked)}
      />
    </Card>
  );
}
