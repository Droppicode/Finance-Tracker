import React from 'react';
import Modal from './Modal';
import CategoryFilter from './CategoryFilter';
import DateRangePicker from './DateRangePicker';
import Button from './Button';

const FilterModal = ({
  isOpen,
  onClose,
  allCategories,
  selectedCategoryIds,
  onCategoryFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
}) => {
  const categoryOptions = (allCategories || []).map(c => ({ value: c.id, label: c.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros de Transações">
      <div className="space-y-4">
        <CategoryFilter
          options={categoryOptions}
          selectedItems={selectedCategoryIds}
          onChange={onCategoryFilterChange}
          filterName="Categorias"
        />
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={onApplyFilters} variant="primary">
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
