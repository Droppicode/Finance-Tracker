import { useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import InvestmentSearchPopover from '../components/InvestmentSearchPopover';
import InvestmentTypeFilter from '../components/InvestmentTypeFilter'; // New import
import DateRangePicker from '../components/DateRangePicker';
import { Plus, X, Trash2, ChevronDown } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useInvestments } from '../context/InvestmentContext';
import { useUtils } from '../context/UtilsContext';
import axiosInstance from '../api/axios';

const investmentOptions = [
  { value: 'stock', label: 'Ações' },
  { value: 'fund', label: 'FIIs' },
  { value: 'etf', label: 'ETFs' },
  { value: 'bdr', label: 'BDRs' },
  { value: 'index', label: 'Índices' },
  { value: 'criptomoedas', label: 'Criptomoedas' },
  { value: 'outros', label: 'Outros' },
];

// Util para obter label a partir do value
const labelFromType = (type) => investmentOptions.find(o => o.value === type)?.label || 'Outros';

// Cores para os gráficos
const COLORS_INVESTMENTS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function InvestimentosPage() {
  const { investments, addInvestment, removeInvestment, loading } = useInvestments();
  const { startDate, endDate, updateDates } = useUtils();
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [assetQuote, setAssetQuote] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchPopoverRef = useRef(null);

  // New states for grouping and filtering
  const [groupByAsset, setGroupByAsset] = useState(false);
  const [filterType, setFilterType] = useState([]); // Changed to array
  const [expandedGroups, setExpandedGroups] = useState([]);

  // Busca preço (cotação) pelo backend, autenticado
  const handleSelectInvestment = async (investment) => {
    setAssetName(`${investment.stock} - ${investment.name}`);
    setShowSearchPopover(false);
    setIsPriceLoading(true);
    setAssetPrice(null);
    setAssetQuote(null);
    try {
      const response = await axiosInstance.get(`/api/investments/quote/?symbol=${investment.stock}`);
      console.log("Investment data: ", response.data)
      setAssetPrice(response.data.regularMarketPrice);
      setAssetQuote(response.data);

      setAssetType(investment.type);
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
    } finally {
      setIsPriceLoading(false);
    }
  };

  // Adiciona novo investimento (local+API)
  const handleAddInvestment = async (e) => {
    e.preventDefault();
    const quantity = parseFloat(assetQuantity);
    if (!assetName || !quantity || !assetType || assetPrice === null) {
      console.log("Formulário incompleto ou preço não carregado");
      return;
    }
    // Parse asset data and round for backend
    const [symbol, ...rest] = assetName.split(' - ');
    const name = rest.join(' - ');
    const formattedPrice = parseFloat(assetPrice).toFixed(5);
    const formattedQuantity = parseFloat(assetQuantity).toFixed(5);

    await addInvestment({
      name: name || symbol,
      symbol: symbol,
      quantity: formattedQuantity,
      price: formattedPrice,
      currency: 'BRL',
      notes: '',
      purchase_date: new Date().toISOString().slice(0, 10),
      type: assetType,
    });

    setAssetName('');
    setAssetQuantity('');
    setAssetPrice(null);
    setAssetType('');
    setAssetQuote(null);
  };

  // Somador
  const totalInvested = useMemo(() => {
    return investments.reduce((acc, { quantity, price }) => acc + (parseFloat(quantity) * parseFloat(price)), 0);
  }, [investments]);

  // Processed investments for display (filtering and grouping)
  const processedInvestments = useMemo(() => {
    let filtered = investments;

    // Apply type filter
    if (filterType.length > 0) { // Modified for array check
      filtered = filtered.filter(inv => filterType.includes(inv.type));
    }

    // Apply date filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(inv => new Date(inv.purchase_date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(inv => new Date(inv.purchase_date) <= end);
    }

    // Apply grouping
    if (groupByAsset) {
      const groupedMap = {};
      filtered.forEach(inv => {
        // Use symbol as the key for grouping
        if (!groupedMap[inv.symbol]) {
          groupedMap[inv.symbol] = {
            ...inv,
            quantity: 0,
            totalValue: 0,
            // Store original IDs for potential removal if ungrouped
            originalIds: [],
            // Keep the first purchase_date for display, or adjust as needed
            purchase_date: inv.purchase_date,
          };
        }
        groupedMap[inv.symbol].quantity += parseFloat(inv.quantity);
        groupedMap[inv.symbol].totalValue += parseFloat(inv.quantity) * parseFloat(inv.price);
        groupedMap[inv.symbol].originalIds.push(inv.id);
      });

      return Object.values(groupedMap).map(groupedInv => ({
        ...groupedInv,
        price: groupedInv.totalValue / groupedInv.quantity, // Weighted average price
        // For grouped items, the ID should be unique, or handle removal differently
        id: groupedInv.symbol, // Using symbol as a temporary ID for grouped items
      }));
    }

    return filtered;
  }, [investments, groupByAsset, filterType, startDate, endDate]);

  // Dados para gráfico - agrupa por type salvo
  const chartData = useMemo(() => {
    const map = {};
    processedInvestments.forEach(inv => {
      const t = inv.type || 'outros';
      map[t] = (map[t] || 0) + (parseFloat(inv.quantity) * parseFloat(inv.price));
    });
    return Object.entries(map).map(([type, value]) => ({ name: labelFromType(type), value }));
  }, [processedInvestments]);

  const toggleGroup = (symbol) => {
    setExpandedGroups(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div>
      <Header title="Carteira de Investimentos" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Coluna do Formulário */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Adicionar Investimento</h2>
            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
                <Input
                  placeholder="Ex: Tesouro Selic 2029, MXRF11"
                  value={assetName}
                  onChange={(e) => {
                    setAssetName(e.target.value);
                    setShowSearchPopover(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchPopoverRef.current) {
                      e.preventDefault();
                      searchPopoverRef.current();
                    }
                  }}
                />
                {showSearchPopover && (
                  <InvestmentSearchPopover
                    searchTerm={assetName}
                    onSearchSubmit={searchPopoverRef}
                    onSelectInvestment={handleSelectInvestment}
                    onClose={() => setShowSearchPopover(false)}
                  />
                )}
              </div>
              {isPriceLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando preço...</p>}
              {assetPrice !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço por unidade</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={assetPrice}
                    onChange={(e) => setAssetPrice(e.target.value)}
                    disabled={isPriceLoading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={assetQuantity}
                  onChange={(e) => setAssetQuantity(e.target.value)}
                  disabled={assetPrice === null}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Investimento</label>
                <Select
                  options={investmentOptions}
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  placeholder="Selecione o tipo..."
                />
              </div>
              <Button type="submit" variant="primary" icon={Plus} className="w-full" disabled={loading}>
                Adicionar
              </Button>
            </form>
          </Card>
        </div>
        {/* Coluna de Detalhes do Ativo */}
        {assetQuote && (
          <div className="lg:col-span-1 relative">
            <Card className="p-6 rounded-lg flex flex-col absolute inset-0">
              <div className="overflow-y-auto flex-1 min-h-0">
                <div className="flex items-center mb-4">
                  {assetQuote.logourl && (
                    <img src={assetQuote.logourl} alt={`${assetQuote.symbol} logo`} className="w-10 h-10 mr-3" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{assetQuote.symbol}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{assetQuote.longName || assetQuote.shortName}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400">Preço Atual</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {assetQuote.regularMarketPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className={`text-xl font-bold ${parseFloat(assetQuote.regularMarketChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {!isNaN(parseFloat(assetQuote.regularMarketChange)) ? parseFloat(assetQuote.regularMarketChange).toFixed(2) : 'N/A'} ({!isNaN(parseFloat(assetQuote.regularMarketChangePercent)) ? parseFloat(assetQuote.regularMarketChangePercent).toFixed(2) : 'N/A'}%)
                  </p>
                </div>

                {/* Agrupamento 1: Desempenho do Dia */}
                <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Desempenho do Dia</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <p className="text-gray-400 text-sm">Abertura:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketOpen?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-gray-400 text-sm">Máxima do Dia:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketDayHigh?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-gray-400 text-sm">Mínima do Dia:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketDayLow?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-gray-400 text-sm">Fechamento Anterior:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketPreviousClose?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-gray-400 text-sm">Volume:
                    </p><p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketVolume?.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Agrupamento 2: Período de 52 Semanas */}
                <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Período de 52 Semanas</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <p className="text-gray-400 text-sm">Máxima 52 Semanas:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekHigh?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-gray-400 text-sm">Mínima 52 Semanas:</p>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekLow?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>

                {/* Outras Métricas */}
                {(assetQuote.marketCap || assetQuote.priceEarnings) && (
                  <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Outras Métricas</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {assetQuote.marketCap && (
                        <>
                          <p className="text-gray-400 text-sm">Valor de Mercado:</p>
                          <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.marketCap?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</p>
                        </>
                      )}
                      {assetQuote.priceEarnings && (
                        <>
                          <p className="text-gray-400 text-sm">P/L:</p>
                          <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.priceEarnings?.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Rodapé: Horário da Cotação */}
                {assetQuote.regularMarketTime && (
                  <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4 text-right text-xs text-gray-500 dark:text-gray-400">
                    Última atualização: {new Date(assetQuote.regularMarketTime).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
        {/* Coluna do Gráfico */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Alocação da Carteira</h2>
              <div className="text-right">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Investido</span>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_INVESTMENTS[index % COLORS_INVESTMENTS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    }
                  />
                  <Legend wrapperStyle={{ color: 'var(--legend-text, #374151)' }} className="dark:[--legend-text:#d1d5db]" />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </Card>
        </div>
      </div>

      {/* Investimentos Salvos - Nova Seção */}
      <div className="mt-6">
        <Card>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Investimentos Salvos</h3>
            <div className="flex items-center space-x-4">
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
              {processedInvestments.map(inv => {
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
                          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                                  {new Date(originalInv.purchase_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
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
        </Card>
      </div>
    </div>
  );
}