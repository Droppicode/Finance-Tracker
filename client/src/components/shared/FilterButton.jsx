import React from 'react';
import Button from './Button';
import { Filter } from 'lucide-react';

const FilterButton = ({ onClick, className = '' }) => {
  return (
    <Button onClick={onClick} variant="secondary" className={`flex items-center space-x-2 ${className}`}>
      <Filter className="w-5 h-5" />
      <span>Filtros</span>
    </Button>
  );
};

export default FilterButton;
