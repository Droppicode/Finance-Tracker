import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Select from '../shared/Select';
import Input from '../shared/Input';
import InvestmentSearchPopover from './InvestmentSearchPopover';
import OtherInvestmentForm from './OtherInvestmentForm';
import { getQuote } from '../../api/brapi';
import { searchSymbol } from '../../api/brapi'; // Import searchSymbol
import { Plus, Info, Search } from 'lucide-react';

export default function AddInvestmentForm({ addInvestment, loading, investmentOptions, formType, onInvestmentSelected }) {
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetPrice, setAssetPrice] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [error, setError] = useState(null);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const searchInputRef = useRef(null);

  // New state for search results and loading
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [lastSearchTerm, setLastSearchTerm] = useState(null); // To prevent re-searching same term

  const navigate = useNavigate();
  const location = useLocation();

  const processedLocationKey = useRef(null);

  const handleSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setLastSearchTerm(null);
      return;
    }
    if (term === lastSearchTerm) { // Prevent searching the same term repeatedly
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const results = await searchSymbol(term);
      setSearchResults(results);
      setLastSearchTerm(term);
    } catch (err) {
      console.error("Erro ao buscar investimentos:", err);
      setSearchError("Erro ao buscar investimentos. Tente novamente.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [lastSearchTerm]);

  const handleSelectInvestment = useCallback(async (investment) => {
    setAssetName(`${investment.stock} - ${investment.name}`);
    setAssetType(investment.type);
    setSelectedInvestment(investment);
    setShowSearchPopover(false);
    setIsEditingPrice(false);
    setError(null);
    setSearchResults([]); // Clear search results after selection
    setLastSearchTerm(null); // Reset last search term

    setIsPriceLoading(true); // Always fetch the full quote to ensure complete data
    try {
      const quote = await getQuote(investment.stock);
      if (quote) {
        setAssetPrice(quote.regularMarketPrice);
        if (onInvestmentSelected) {
          onInvestmentSelected(quote); // Pass the full quote to the parent
        }
      } else {
        setError(`Não foi possível obter o preço atual de ${investment.stock}. Verifique o símbolo do ativo ou tente novamente mais tarde.`);
        setAssetPrice(null);
      }
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
      setError(`Erro ao buscar detalhes de ${investment.stock}: ${errorMessage}. Por favor, tente novamente ou insira o preço manualmente.`);
      setAssetPrice(null);
    } finally {
      setIsPriceLoading(false);
    }
  }, [onInvestmentSelected]);
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
    setSearchResults([]); // Clear search results after adding
    setLastSearchTerm(null); // Reset last search term
    setShowSearchPopover(false); // Close the search popover
  };

  return (
    <>
      {formType === 'market' ? (
        <form onSubmit={handleAddInvestment} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo / Onde</label>
            <div className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                placeholder="Ex: MXRF11, AAPL34, PETR4, ..."
                value={assetName}
                onChange={(e) => {
                  setAssetName(e.target.value);
                  setShowSearchPopover(true);
                  setError(null);
                  // Clear search results if input changes after a search
                  if (lastSearchTerm && e.target.value !== lastSearchTerm) {
                    setSearchResults([]);
                    setLastSearchTerm(null);
                  }
                }}
                onFocus={() => setShowSearchPopover(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === searchInputRef.current) {
                    e.preventDefault();
                    handleSearch(assetName); // Trigger search on Enter
                  }
                }}
              />
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSearchPopover(true);
                  handleSearch(assetName); // Trigger search on button click
                }}
                className="block lg:hidden"
                variant="secondary"
                size="icon"
                title="Pesquisar"
              >
                <Search className="w-6 h-6" />
              </Button>
            </div>
            {showSearchPopover && (
              <InvestmentSearchPopover
                searchTerm={assetName}
                searchResults={searchResults} // Pass search results
                loadingSearch={loadingSearch} // Pass loading state
                searchError={searchError} // Pass error state
                onSelectInvestment={handleSelectInvestment}
                onClose={() => setShowSearchPopover(false)}
                searchInputRef={searchInputRef}
              />
            )}
          </div>
          {isPriceLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando preço...</p>}
          {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
          {(assetPrice !== null || (selectedInvestment && !isPriceLoading)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço por unidade</label>
              <div className="flex items-center gap-2">
                <div className="grow">
                  {isEditingPrice || assetPrice === null ? (
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={assetPrice || ""}
                      onChange={(e) => { setAssetPrice(e.target.value); setError(null); }}
                      onBlur={() => assetPrice !== null && setIsEditingPrice(false)}
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
                {selectedInvestment && assetPrice !== null && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="block lg:hidden"
                    onClick={() => navigate(`/investimentos/${selectedInvestment.stock}`, { state: { fromAddInvestmentForm: true, asset: selectedInvestment } })}
                    title="Ver detalhes do ativo"
                  >
                    <Info className="w-6 h-6" />
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.target.closest('form').requestSubmit();
                }
              }}
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