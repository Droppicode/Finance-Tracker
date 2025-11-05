import { useState, useRef } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Select from '../shared/Select';
import Input from '../shared/Input';
import InvestmentSearchPopover from './InvestmentSearchPopover';
import OtherInvestmentForm from './OtherInvestmentForm';
import { Plus } from 'lucide-react';

export default function AddInvestmentForm({ addInvestment, loading, investmentOptions, onSelectInvestment }) {
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchPopoverRef = useRef(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [formType, setFormType] = useState('market');
  const [error, setError] = useState(null);

  const handleSelectInvestment = async (investment) => {
    setAssetName(`${investment.stock} - ${investment.name}`);
    setShowSearchPopover(false);
    setIsPriceLoading(true);
    setAssetPrice(null);
    setIsEditingPrice(false);
    setError(null);
    try {
      const quote = await onSelectInvestment(investment);
      if (quote) {
        setAssetPrice(quote.regularMarketPrice);
        setAssetType(investment.type);
      }
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
    } finally {
      setIsPriceLoading(false);
    }
  };

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
  };

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Adicionar Investimento</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setFormType('market')} className={`px-3 py-1 text-sm rounded-md ${formType === 'market' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Mercado</button>
          <button onClick={() => setFormType('other')} className={`px-3 py-1 text-sm rounded-md ${formType === 'other' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Outros</button>
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
  );
}
