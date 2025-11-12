import { useRef, useEffect } from 'react';

const InvestmentSearchPopover = ({ searchTerm, searchResults, loadingSearch, searchError, onSelectInvestment, onClose, searchInputRef }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, searchInputRef, onClose]);

  const handleSelect = (investment) => {
    onSelectInvestment(investment);
    onClose();
  };

  return (
    <div className="absolute z-10 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4" ref={wrapperRef}>
      {loadingSearch && <p className="text-blue-500 dark:text-blue-400">Buscando...</p>}
      {searchError && <p className="text-red-500 dark:text-red-400">{searchError}</p>}

      {searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Resultados da Busca:</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((result) => (
              <li
                key={result.stock}
                className="py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                onClick={() => handleSelect(result)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{result.stock} - {result.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{result.sector} ({result.type})</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchResults.length === 0 && searchTerm.trim() && !loadingSearch && !searchError && (
        <p className="text-gray-500 dark:text-gray-400">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
};

export default InvestmentSearchPopover;
