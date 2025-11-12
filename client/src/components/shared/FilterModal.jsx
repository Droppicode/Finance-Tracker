import React from 'react';
import Modal from './Modal';
import CategoryFilter from './CategoryFilter';
import DateRangePicker from './DateRangePicker';
import ToggleSwitch from './ToggleSwitch';

const FilterModal = ({
  isOpen,
  onClose,
  title = "Filtros",
  allCategories,
  selectedCategoryIds,
  onCategoryFilterChange,
  filterName = "Categorias",
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showGroupByAsset,
  groupByAssetState,
  onGroupByAssetChange,
  groupByAssetText = "Agrupar por Ativo"
}) => {
  const categoryOptions = (allCategories || []).map(c => ({ value: c.id, label: c.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <CategoryFilter
          options={categoryOptions}
          selectedItems={selectedCategoryIds}
          onChange={onCategoryFilterChange}
          filterName={filterName}
        />
        {showGroupByAsset && (
          <ToggleSwitch
            label={groupByAssetText}
            checked={groupByAssetState}
            onChange={onGroupByAssetChange}
          />
        )}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
    </Modal>
  );
};

export default FilterModal;
