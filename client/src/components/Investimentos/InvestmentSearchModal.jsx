import { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { searchSymbol } from '../../api/brapi';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function InvestmentSearchModal({ isOpen, onClose, onSelectInvestment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const results = await searchSymbol(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error("Erro ao buscar investimentos:", err);
      setSearchError("Erro ao buscar investimentos. Tente novamente.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (investment) => {
    onSelectInvestment(investment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">Buscar Ativo</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            placeholder="Digite o símbolo do ativo (ex: PETR4)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Button type="submit" icon={Search} disabled={loadingSearch}>
            {loadingSearch ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loadingSearch && <p>Buscando...</p>}
        {searchError && <p className="text-red-500">{searchError}</p>}
        {searchResults.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((result) => (
              <li
                key={result.stock}
                className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                onClick={() => handleSelect(result)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{result.stock} - {result.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{result.type}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {searchResults.length === 0 && !loadingSearch && searchTerm && (
          <p>Nenhum resultado encontrado para "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}
