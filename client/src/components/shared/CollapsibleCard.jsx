import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from './Card'; // Assuming Card component is in the same shared folder

const CollapsibleCard = ({ title, children, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
        <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <div className="pt-6">
          {children}
        </div>
      )}
    </Card>
  );
};

export default CollapsibleCard;
