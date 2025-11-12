import { useState, useRef, useEffect } from 'react';
import { Filter, CheckSquare, Square } from 'lucide-react';
import Button from './Button';

const CategoryFilter = ({
  options,
  selectedItems,
  onChange,
  filterName = 'Categorias'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

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
    const newSelectedItems = selectedItems.includes(optionValue)
      ? selectedItems.filter((item) => item !== optionValue)
      : [...selectedItems, optionValue];
    onChange(newSelectedItems);
  };

  const handleToggleAll = () => {
    if (selectedItems.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange(options.map(option => option.value)); // Select all
    }
  };

  const selectedCount = selectedItems.length;
  const allSelected = options && options.length > 0 && selectedItems.length === options.length;

  return (
    <div className="relative" ref={wrapperRef}>
      <Button variant="secondary" icon={Filter} onClick={() => setIsOpen(!isOpen)}>
        {selectedCount > 0 ? `${selectedCount} ${filterName}(s)` : `Filtrar ${filterName}`}
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <ul className="py-1 max-h-72 overflow-y-auto">
            {options && options.length > 0 && (
              <li
                onClick={handleToggleAll}
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <span>Todos</span>
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </li>
            )}
            {(options || []).map(option => {
              const isSelected = selectedItems.includes(option.value);
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

export default CategoryFilter;
