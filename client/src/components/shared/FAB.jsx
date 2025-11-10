import React from 'react';
import { Plus } from 'lucide-react';

const FAB = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${className}`}
      aria-label="Adicionar nova transação"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default FAB;
