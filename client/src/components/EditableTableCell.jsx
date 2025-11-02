import { useState, useEffect } from 'react';

export default function EditableTableCell({ value, onSave, cellType = 'text', options = [], transactionType, onTypeChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = () => {
    if (currentValue !== value) {
      onSave(currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    if (cellType === 'number') {
      const numericValue = e.target.value.replace(/[^0-9.,-]/g, '');
      setCurrentValue(numericValue);
    } else {
      setCurrentValue(e.target.value);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleTypeClick = (e) => {
    e.stopPropagation(); // Prevent opening the editor
    if (onTypeChange) {
      onTypeChange(transactionType === 'credit' ? 'debit' : 'credit');
    }
  }

  if (isEditing) {
    if (cellType === 'select') {
      return (
        <select
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1 border rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={cellType === 'number' ? 'number' : 'text'}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        className="w-full px-2 py-1 border rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer w-full h-full flex items-center">
      {transactionType && (
        <span onClick={handleTypeClick} className="mr-2 font-bold cursor-pointer">
          {transactionType === 'credit' ? '+' : '-'}
        </span>
      )}
      <span className="flex-grow">
        {cellType === 'number' ? (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
      </span>
    </div>
  );
}
