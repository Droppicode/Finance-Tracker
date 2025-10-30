import { useState, useRef, useEffect } from 'react';
import { Filter, CheckSquare, Square } from 'lucide-react';
import Button from './Button';

const InvestmentTypeFilter = ({ options, selectedTypes, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Lógica para fechar o popover se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleToggle = (optionValue) => {
    const newSelectedTypes = selectedTypes.includes(optionValue)
      ? selectedTypes.filter((type) => type !== optionValue)
      : [...selectedTypes, optionValue];
    onChange(newSelectedTypes);
  };

  const handleToggleAll = () => {
    if (selectedTypes.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange(options.map(option => option.value)); // Select all
    }
  };

  const selectedCount = selectedTypes.length;
  const allSelected = selectedTypes.length === options.length;

  return (
    <div className="relative" ref={wrapperRef}>
      <Button variant="secondary" icon={Filter} onClick={() => setIsOpen(!isOpen)}>
        {selectedCount > 0 ? `${selectedCount} Tipo(s)` : 'Filtrar Tipos'}
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <ul className="py-1 max-h-72 overflow-y-auto">
            <li
              onClick={handleToggleAll}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <span>Todos os Tipos</span>
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-500" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </li>
            {options.map((option) => {
              const isSelected = selectedTypes.includes(option.value);
              return (
                <li
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvestmentTypeFilter;