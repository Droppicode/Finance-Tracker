import Modal from '../shared/Modal';
import ToggleSwitch from '../shared/ToggleSwitch';
import CategoryFilter from '../shared/CategoryFilter';
import DateRangePicker from '../shared/DateRangePicker';
import Button from '../shared/Button';

const InvestmentFilterModal = ({
  isOpen,
  onClose,
  groupByAsset,
  onGroupByAssetChange,
  investmentOptions,
  selectedTypes,
  onFilterTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros de Investimentos">
      <div className="space-y-4">
        <ToggleSwitch
          label="Agrupar por Ativo"
          checked={groupByAsset}
          onChange={onGroupByAssetChange}
        />
        <CategoryFilter
          options={investmentOptions}
          selectedItems={selectedTypes}
          onChange={onFilterTypeChange}
          filterName="Tipo"
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

export default InvestmentFilterModal;
