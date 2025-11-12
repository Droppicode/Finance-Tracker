import { useState, useEffect, useRef, useCallback } from 'react'; // Importe useCallback
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Select from '../shared/Select';
import Input from '../shared/Input';
import InvestmentSearchPopover from './InvestmentSearchPopover';
import OtherInvestmentForm from './OtherInvestmentForm';
import { getQuote } from '../../api/brapi';
import { Plus, Info } from 'lucide-react';

export default function AddInvestmentForm({ addInvestment, loading, investmentOptions, formType }) {
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [error, setError] = useState(null);
  const [showSearchPopover, setShowSearchPopover] = useState(false); // Renamed from isSearchModalOpen
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const searchPopoverRef = useRef(null); // Ref to expose handleSearch from popover
  const searchInputRef = useRef(null); // Ref for the search input
  const navigate = useNavigate();
  const location = useLocation();

  const processedLocationKey = useRef(null); 

  const handleSelectInvestment = useCallback(async (investment) => {    
    setAssetName(`${investment.stock} - ${investment.name}`);
    setAssetType(investment.type);
    setSelectedInvestment(investment);
    setShowSearchPopover(false); // Use setShowSearchPopover
    setIsEditingPrice(false);
    setError(null);
    // Removed setSearchTerm('') as assetName now handles both

    if (investment.regularMarketPrice !== null && investment.regularMarketPrice !== undefined) {
      setAssetPrice(investment.regularMarketPrice);
    } else {
      setIsPriceLoading(true);
      try {
        const quote = await getQuote(investment.stock);
        if (quote) {
          setAssetPrice(quote.regularMarketPrice);
        }
      } catch (error) {
        console.error("Erro ao buscar cotação do ativo:", error);
      } finally {
        setIsPriceLoading(false);
      }
    }
  }, [setAssetName, setAssetType, setSelectedInvestment, setShowSearchPopover, setIsEditingPrice, setError, setAssetPrice, setIsPriceLoading]);

  useEffect(() => {
    const { state, key, pathname } = location; 

    if (state?.fromDetailsPage && state?.asset) {
      
      if (processedLocationKey.current === key) return; 
  
      processedLocationKey.current = key;

      const processNavigation = async () => {
        await handleSelectInvestment(state.asset);
        
        navigate(pathname, { replace: true, state: {} });
      };

      processNavigation();
    }
  
  }, [
    handleSelectInvestment, 
    navigate, 
    location
  ]);

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
    setSelectedInvestment(null);
    // Removed setSearchTerm('') as assetName now handles both
  };

  return (
    <>
      {formType === 'market' ? (
        <form onSubmit={handleAddInvestment} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
            <Input
              ref={searchInputRef} // Attach ref to the Input
              placeholder="Ex: Tesouro Selic 2029, MXRF11"
              value={assetName} // Use assetName here
              onChange={(e) => {
                setAssetName(e.target.value);
                setShowSearchPopover(true); // Use setShowSearchPopover
                setError(null);
              }}
              onFocus={() => setShowSearchPopover(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchPopoverRef.current) {
                  e.preventDefault();
                  searchPopoverRef.current(); // Trigger search in popover
                }
              }}
            />
            {showSearchPopover && ( // Only render popover when open
              <InvestmentSearchPopover
                searchTerm={assetName} // Pass assetName as searchTerm
                onSearchSubmit={searchPopoverRef} // Pass the ref
                onClose={() => setShowSearchPopover(false)} // Use setShowSearchPopover
                onSelectInvestment={handleSelectInvestment}
                searchInputRef={searchInputRef} // Pass the search input ref
              />
            )}
          </div>
          {isPriceLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando preço...</p>}
          {assetPrice !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço por unidade</label>
              <div className="flex items-center gap-2">
                <div className="grow">
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
                {selectedInvestment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/investimentos/${selectedInvestment.stock}`, { state: { fromAddInvestmentForm: true, asset: selectedInvestment } })}
                    title="Ver detalhes do ativo"
                  >
                    <Info className="w-5 h-5" />
                  </Button>
                )}
              </div>
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
    </>
  );
}