import { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import ToggleSwitch from '../shared/ToggleSwitch';
import InvestmentTypeFilter from './InvestmentTypeFilter';
import DateRangePicker from '../shared/DateRangePicker';
import { Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const toggleGroup = (symbol) => {
    setExpandedGroups(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Investimentos Salvos</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleSwitch
              label="Agrupar por Ativo"
              checked={groupByAsset}
              onChange={(e) => setGroupByAsset(e.target.checked)}
            />
            <InvestmentTypeFilter
              options={investmentOptions}
              selectedTypes={filterType}
              onChange={setFilterType}
            />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}
              onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
            />
          </div>
        </div>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        ) : processedInvestments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Nenhum investimento salvo ainda.</p>
        ) : (
          <div className="space-y-2 mt-4">
            {paginatedInvestments.map(inv => {
              const isGrouped = groupByAsset && inv.originalIds?.length > 1;
              const isExpanded = expandedGroups.includes(inv.id);

              return (
                <div key={inv.id}>
                  <div
                    className={`flex justify-between items-center p-3 rounded-lg transition-colors duration-200 ${
                      isGrouped
                        ? 'bg-blue-50 dark:bg-blue-900/50 cursor-pointer'
                        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    onClick={() => isGrouped && toggleGroup(inv.id)}
                  >
                    <div className="flex items-center gap-4 grow">
                      {isGrouped && (
                        <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{inv.symbol}</span>
                        {isGrouped && (
                          <span className="ml-2 text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded-full">
                            {inv.originalIds.length} compras
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
                        onClick={() => removeInvestment(inv.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        aria-label="Remover compra"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="pl-10 pt-2 pb-2 space-y-2">
                      {investments
                        .filter(originalInv => originalInv.symbol === inv.symbol)
                        .map(originalInv => (
                          <div key={originalInv.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <div className="flex items-center gap-4 grow">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(originalInv.purchase_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                  {(originalInv.quantity * originalInv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {parseFloat(originalInv.quantity).toFixed(2)} x {parseFloat(originalInv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                              </div>
                              <span className="w-24"></span>
                              <button
                                onClick={() => removeInvestment(originalInv.id)}
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                aria-label="Remover compra"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
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
    </Card>
  );
}
