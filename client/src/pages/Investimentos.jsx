import { useState, useMemo } from 'react';
import axiosInstance from '../api/axios';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';

// Importando ícones da biblioteca lucide-react
import {
  Plus,
  Search,
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
  const [assetValue, setAssetValue] = useState('');
  const [assetType, setAssetType] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const investmentOptions = [
    { value: 'rf', label: 'Renda Fixa (RF)' },
    { value: 'fii', label: 'Fundos Imobiliários (FII)' },
    { value: 'acoes_br', label: 'Ações (BR)' },
    { value: 'acoes_eua', label: 'Ações (EUA)' },
    { value: 'crypto', label: 'Criptomoedas' },
  ];

  const handleAddInvestment = (e) => {
    e.preventDefault();
    const newValue = parseFloat(assetValue);
    if (!assetName || !newValue || !assetType) {
      // (Em um app real, mostraria um erro)
      console.log("Formulário incompleto");
      return;
    }

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
    setAssetValue('');
    setAssetType('');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const response = await axiosInstance.get(`/api/investments/search/?symbol=${searchTerm}`);
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error("Erro ao buscar investimentos:", err);
      setSearchError("Erro ao buscar investimentos. Tente novamente.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, item) => acc + item.value, 0);
  }, [investments]);

  return (
    <div>
      <Header title="Carteira de Investimentos" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Busca de Investimentos */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Buscar Investimento</h2>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Buscar por símbolo (ex: AAPL, PETR4)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={loadingSearch} icon={Search}>
                Buscar
              </Button>
            </div>

            {loadingSearch && <p className="text-blue-500 dark:text-blue-400">Buscando...</p>}
            {searchError && <p className="text-red-500 dark:text-red-400">{searchError}</p>}

            {searchResults.length > 0 && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Resultados da Busca:</h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((result) => (
                    <li key={result.symbol+':'+result.mic_code} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{result.symbol} - {result.instrument_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.exchange} ({result.country})</p>
                      </div>
                      {/* Aqui você pode adicionar um botão para 'Adicionar à carteira' */}
                      <Button variant="secondary" size="sm">Adicionar</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Coluna do Formulário */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Adicionar Investimento</h2>
            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
                <Input
                  placeholder="Ex: Tesouro Selic 2029, MXRF11"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Investido (R$)</label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={assetValue}
                  onChange={(e) => setAssetValue(e.target.value)}
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