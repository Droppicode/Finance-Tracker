import { useState, useMemo, useRef } from 'react';
import axiosInstance from '../api/axios';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import InvestmentSearchPopover from '../components/InvestmentSearchPopover';

// Importando ícones da biblioteca lucide-react
import {
  Plus,
} from 'lucide-react';

// Importando componentes de gráficos da biblioteca recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


// Cores para os gráficos
const COLORS_INVESTMENTS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Dados simulados para a carteira de investimentos
const mockInvestmentData = [
  { name: 'Renda Fixa (RF)', value: 15000 },
  { name: 'Fundos Imobiliários (FII)', value: 8500 },
  { name: 'Ações (BR)', value: 12000 },
  { name: 'Ações (EUA)', value: 5000 },
];


export default function InvestimentosPage() {

  const [investments, setInvestments] = useState(mockInvestmentData);
  const [assetName, setAssetName] = useState('');
  const [assetQuantity, setAssetQuantity] = useState('');
  const [assetPrice, setAssetPrice] = useState(null);
  const [assetQuote, setAssetQuote] = useState(null); // New state for full quote object
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState('');

  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchPopoverRef = useRef(null); // Ref to hold the handleSearch function from popover

  const investmentOptions = [
    { value: 'stock', label: 'Ações (Stocks)' },
    { value: 'forex', label: 'Forex (Câmbio)' },
    { value: 'crypto', label: 'Criptomoedas (Cryptocurrencies)' },
    { value: 'etf', label: 'ETFs (Fundos de Índice)' },
    { value: 'fund', label: 'Fundos (Mutual Funds)' },
    { value: 'index', label: 'Índices (Indices)' },
    { value: 'commodity', label: 'Commodities' },
    { value: 'fixed_income', label: 'Renda Fixa (Fixed Income)' }
  ];

  const handleSelectInvestment = async (investment) => {
    setAssetName(`${investment.symbol} - ${investment.instrument_name}`);
    setShowSearchPopover(false);
    setIsPriceLoading(true);
    setAssetPrice(null);
    setAssetQuote(null); // Reset assetQuote when a new search is initiated
    try {
      const response = await axiosInstance.get(`/api/investments/quote/?symbol=${investment.symbol}`);
      setAssetPrice(response.data.close);
      setAssetQuote(response.data); // Store the full quote object
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleAddInvestment = (e) => {
    e.preventDefault();
    const quantity = parseFloat(assetQuantity);
    if (!assetName || !quantity || !assetType || assetPrice === null) {
      // (Em um app real, mostraria um erro)
      console.log("Formulário incompleto ou preço não carregado");
      return;
    }

    const newValue = quantity * parseFloat(assetPrice);

    const typeLabel = investmentOptions.find(opt => opt.value === assetType)?.label || 'Outros';

    // Simula a adição (ou atualização se o tipo já existe)
    setInvestments(prev => {
      const existing = prev.find(inv => inv.name === typeLabel);
      if (existing) {
        return prev.map(inv =>
          inv.name === typeLabel ? { ...inv, value: inv.value + newValue } : inv
        );
      }
      return [...prev, { name: typeLabel, value: newValue }];
    });

    // Limpa o formulário
    setAssetName('');
    setAssetQuantity('');
    setAssetPrice(null);
    setAssetType('');
  };

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, item) => acc + item.value, 0);
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
              <div className="relative"> {/* Added relative positioning here */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
                <Input
                  placeholder="Ex: Tesouro Selic 2029, MXRF11"
                  value={assetName}
                  onChange={(e) => {
                    setAssetName(e.target.value);
                    setShowSearchPopover(true); // Show popover on change
                    setAssetQuote(null); // Clear assetQuote when input changes
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      if (searchPopoverRef.current) {
                        searchPopoverRef.current(); // Trigger search in popover
                      }
                    }
                  }}
                />
                {showSearchPopover && (
                  <InvestmentSearchPopover
                    searchTerm={assetName}
                    onSearchSubmit={searchPopoverRef} // Pass the ref
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
                  disabled={assetPrice === null} // Disable if price is not loaded
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
              <Button type="submit" variant="primary" icon={Plus} className="w-full">
                Adicionar
              </Button>
            </form>
          </Card>
        </div>

        {/* Coluna de Detalhes do Ativo */}
        {assetQuote && (
          <div className="lg:col-span-1">
            <Card className="p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-700 pb-3 mb-4">Detalhes do Ativo</h2>
              
              {/* Destaque Principal: Variação Diária */}
              <div className="mb-4">
                <p className="text-sm text-gray-400">Variação Diária</p>
                <p className={`text-2xl font-bold ${parseFloat(assetQuote.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {!isNaN(parseFloat(assetQuote.change)) ? parseFloat(assetQuote.change).toFixed(2) : 'N/A'} ({!isNaN(parseFloat(assetQuote.percent_change)) ? parseFloat(assetQuote.percent_change).toFixed(2) : 'N/A'}%) 
                </p>
              </div>

              {/* Agrupamento 1: Desempenho do Dia */}
              <div className="mt-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Desempenho do Dia</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <p className="text-gray-400 text-sm">Abertura:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.open?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                  <p className="text-gray-400 text-sm">Máxima do Dia:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.high?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                  <p className="text-gray-400 text-sm">Mínima do Dia:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.low?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                  <p className="text-gray-400 text-sm">Fechamento Anterior:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.close?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                  <p className="text-gray-400 text-sm">Volume:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.volume?.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {/* Agrupamento 2: Período de 52 Semanas */}
              <div className="mt-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Período de 52 Semanas</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <p className="text-gray-400 text-sm">Máxima 52 Semanas:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.fifty_two_week.high?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                  <p className="text-gray-400 text-sm">Mínima 52 Semanas:</p>
                  <p className="text-gray-100 font-medium text-sm">{assetQuote.fifty_two_week.low?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
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
                    data={investments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {investments.map((entry, index) => (
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
          </Card>
        </div>
      </div>
    </div>
  );

}