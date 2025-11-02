import { useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import InvestmentSearchPopover from '../components/InvestmentSearchPopover';
import OtherInvestmentForm from '../components/OtherInvestmentForm';
import OtherInvestmentCard from '../components/OtherInvestmentCard';
import InvestmentTypeFilter from '../components/InvestmentTypeFilter'; // New import
import DateRangePicker from '../components/DateRangePicker';
import { Plus, X, Trash2, ChevronDown, AreaChart, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import AssetChart from '../components/AssetChart';
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
const COLORS_INVESTMENTS = ['#3b82f6', '#14b8a6', '#6366f1', '#22c55e', '#818cf8', '#06b6d4', '#a3e635'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Valor: {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function InvestimentosPage() {
  const { investments, otherInvestments, addInvestment, removeInvestment, removeOtherInvestment, loading } = useInvestments();
  const { startDate, endDate, updateDates } = useUtils();
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [assetQuote, setAssetQuote] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchPopoverRef = useRef(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [formType, setFormType] = useState('market');
  const [error, setError] = useState(null);


  // New states for grouping and filtering
  const [groupByAsset, setGroupByAsset] = useState(false);
  const [filterType, setFilterType] = useState([]); // Changed to array
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Busca preço (cotação) pelo backend, autenticado
  const handleSelectInvestment = async (investment) => {
    setAssetName(`${investment.stock} - ${investment.name}`);
    setShowSearchPopover(false);
    setIsPriceLoading(true);
    setAssetPrice(null);
    setAssetQuote(null);
    setIsEditingPrice(false);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/investments/quote/?symbol=${investment.stock}`);
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
      let errorMessage = "Por favor, preencha todos os campos obrigatórios: ";
      const missingFields = [];
      if (!assetName) missingFields.push("Ativo");
      if (!quantity) missingFields.push("Quantidade");
      if (!assetType) missingFields.push("Tipo de Investimento");
      if (assetPrice === null) missingFields.push("Preço (aguarde carregar)");
      
      setError(errorMessage + missingFields.join(', ') + '.');
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

  const paginatedInvestments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedInvestments.slice(startIndex, endIndex);
  }, [processedInvestments, currentPage]);

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

      {/* First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Coluna do Formulário */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Adicionar Investimento</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setFormType('market')} className={`px-3 py-1 text-sm rounded-md ${formType === 'market' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Mercado</button>
                <button onClick={() => setFormType('other')} className={`px-3 py-1 text-sm rounded-md ${formType === 'other' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Outros</button>
              </div>
            </div>
            {formType === 'market' ? (
              <form onSubmit={handleAddInvestment} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
                  <Input
                    placeholder="Ex: Tesouro Selic 2029, MXRF11"
                    value={assetName}
                    onChange={(e) => {
                      setAssetName(e.target.value);
                      setShowSearchPopover(true);
                      setError(null);
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
                    {isEditingPrice ? (
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={assetPrice}
                        onChange={(e) => { setAssetPrice(e.target.value); setError(null); }}
                        onBlur={() => setIsEditingPrice(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.target.closest('form').requestSubmit();
                          }
                        }}
                        autoFocus
                        disabled={isPriceLoading}
                      />
                    ) : (
                      <div
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600"
                        onClick={() => setIsEditingPrice(true)}
                      >
                        <p className="text-gray-900 dark:text-white">
                          {parseFloat(assetPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="100"
                    value={assetQuantity}
                    onChange={(e) => { setAssetQuantity(e.target.value); setError(null); }}
                    disabled={assetPrice === null}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Investimento</label>
                  <Select
                    options={investmentOptions}
                    value={assetType}
                    onChange={(e) => { setAssetType(e.target.value); setError(null); }}
                    placeholder="Selecione o tipo..."
                  />
                </div>
                {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
                <Button type="submit" variant="primary" icon={Plus} className="w-full" disabled={loading}>
                  Adicionar
                </Button>
              </form>
            ) : (
              <OtherInvestmentForm />
            )}
          </Card>
        </div>

        {/* Coluna de Detalhes do Ativo ou Gráfico */}
        {assetQuote ? (
          <div className="h-[30rem] lg:h-auto lg:relative lg:col-span-2">
            <Card className="h-full lg:absolute lg:inset-0 flex flex-col">
              <div className={`flex-1 min-h-0 ${!showChart ? 'overflow-y-auto' : 'flex flex-col overflow-x-auto'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {assetQuote.logourl && (
                      <img src={assetQuote.logourl} alt={`${assetQuote.symbol} logo`} className="w-10 h-10 mr-3" />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{assetQuote.symbol}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{assetQuote.longName || assetQuote.shortName}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowChart(!showChart)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showChart ? <Info className="w-5 h-5" /> : <AreaChart className="w-5 h-5" />}
                  </Button>
                </div>

                {showChart ? (
                  <AssetChart symbol={assetQuote.symbol} />
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Preço Atual</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {assetQuote.regularMarketPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p className={`text-xl font-bold ${parseFloat(assetQuote.regularMarketChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {!isNaN(parseFloat(assetQuote.regularMarketChange)) ? parseFloat(assetQuote.regularMarketChange).toFixed(2) : 'N/A'} ({!isNaN(parseFloat(assetQuote.regularMarketChangePercent)) ? parseFloat(assetQuote.regularMarketChangePercent).toFixed(2) : 'N/A'}%)
                      </p>
                    </div>

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
                        <p className="text-gray-400 text-sm">Volume:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketVolume?.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Período de 52 Semanas</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <p className="text-gray-400 text-sm">Máxima 52 Semanas:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekHigh?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-gray-400 text-sm">Mínima 52 Semanas:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekLow?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      </div>
                    </div>

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

                    {assetQuote.regularMarketTime && (
                      <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4 text-right text-xs text-gray-500 dark:text-gray-400">
                        Última atualização: {new Date(assetQuote.regularMarketTime).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2">
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={assetQuote ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="h-[38rem] lg:relative lg:col-span-2">
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
          </div>
        </div>

        {assetQuote && (
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Outros Investimentos</h3>
          {otherInvestments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum outro investimento salvo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherInvestments.map(inv => (
                <OtherInvestmentCard 
                  key={inv.id} 
                  investment={inv} 
                  onRemove={removeOtherInvestment} 
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}