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
  onToggleCategory,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters, // New prop to apply filters and close modal
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros de Transações">
      <div className="space-y-4">
        <CategoryFilter
          allCategories={allCategories}
          selectedIds={selectedCategoryIds}
          onToggleCategory={onToggleCategory}
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
