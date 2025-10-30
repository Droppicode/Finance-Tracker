import { useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import InvestmentSearchPopover from '../components/InvestmentSearchPopover';
import { Plus } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useInvestments } from '../context/InvestmentContext';
import axiosInstance from '../api/axios';

// Mapeamento canônico de tipos exibidos
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
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [assetQuote, setAssetQuote] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchPopoverRef = useRef(null);

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

  // Dados para gráfico - agrupa por type salvo
  const chartData = useMemo(() => {
    const map = {};
    investments.forEach(inv => {
      const t = inv.type || 'outros';
      map[t] = (map[t] || 0) + (parseFloat(inv.quantity) * parseFloat(inv.price));
    });
    return Object.entries(map).map(([type, value]) => ({ name: labelFromType(type), value }));
  }, [investments]);

  return (
    <div>
      <Header title="Carteira de Investimentos" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna do Formulário */}
        <div className="lg:col-span-1">
          <Card>
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
                    setAssetQuote(null);
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
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Preço por unidade: <span className="font-bold text-gray-800 dark:text-gray-100">{parseFloat(assetPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
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
          <div className="lg:col-span-1">
            <Card className="p-6 rounded-lg border border-gray-700">
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
                  <p className="text-gray-400 text-sm">Volume:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketVolume?.toLocaleString('pt-BR')}</p>
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
            </Card>
          </div>
        )}
        {/* Coluna do Gráfico */}
        <div className="lg:col-span-1">
          <Card>
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
                      value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    }
                  />
                  <Legend wrapperStyle={{ color: 'var(--legend-text, #374151)' }} className="dark:[--legend-text:#d1d5db]" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Listagem dos investimentos salvos */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Investimentos Salvos</h3>
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
              ) : investments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Nenhum investimento salvo ainda.</p>
              ) : (
                <ul>
                  {investments.map(inv => (
                    <li key={inv.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 py-2">
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-100">{inv.symbol}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{inv.name}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({inv.quantity} x {parseFloat(inv.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
                        {inv.type && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{labelFromType(inv.type)}</span>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => removeInvestment(inv.id)}
                        size="sm"
                      >Excluir</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}