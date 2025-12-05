import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';
import { Settings } from 'lucide-react';

import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';
import Button from '../components/shared/Button';
import FAB from '../components/shared/FAB';
import CollapsibleCard from '../components/shared/CollapsibleCard';
import AddTransactionForm from '../components/Dashboard/AddTransactionForm';
import StatementUploadCard from '../components/Dashboard/StatementUploadCard';
import TransactionsCard from '../components/Dashboard/TransactionsCard';
import ConfigModal from '../components/Dashboard/ConfigModal';

export default function DashboardPage() {
  const {
    transactions,
    categories,
    processStatement,
    deleteTransaction,
    clearAllTransactions,
    updateTransactionCategory,
    updateTransactionDetails,
    addCategory,
    removeCategory,
    loading,
    selectedCategoryIds,
    onCategoryFilterChange,
  } = useTransactions();

  const { startDate, endDate, updateDates } = useUtils();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleConfigureClick = (e) => {
    e.stopPropagation();
    setIsConfigModalOpen(true);
  };

  const uploadCardTitle = (
    <div className="flex justify-between items-center w-full">
      <span>Upload de Extrato (PDF)</span>
      {uploadedFile && (
        <Button variant="ghost" size="icon" onClick={handleConfigureClick}>
          <Settings className="w-5 h-5" />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Collapsible Card for small screens */}
        <div className="lg:col-span-1 lg:hidden">
          <CollapsibleCard title={uploadCardTitle} defaultOpen={false}>
            <StatementUploadCard
              processStatement={processStatement}
              uploadedFile={uploadedFile}
              onFileDrop={setUploadedFile}
            />
          </CollapsibleCard>
        </div>
        {/* Regular Card for large screens */}
        <div className="lg:col-span-1 hidden lg:block h-full">
          <Card className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Upload de Extrato (PDF)</h2>
              {uploadedFile && (
                <Button variant="ghost" size="icon" onClick={handleConfigureClick}>
                  <Settings className="w-5 h-5" />
                </Button>
              )}
            </div>
            <StatementUploadCard
              processStatement={processStatement}
              uploadedFile={uploadedFile}
              onFileDrop={setUploadedFile}
              className="flex-grow"
            />
          </Card>
        </div>
        {/* Add Transaction Form Card for large screens */}
        <div className="lg:col-span-2 hidden lg:block h-full">
          <Card className="flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Adicionar Investimento</h2>
            <AddTransactionForm className="flex-grow" />
          </Card>
        </div>
      </div>

      {loading ? (
        <p>Carregando transações...</p>
      ) : (
        <TransactionsCard
          transactions={transactions}
          categories={categories}
          deleteTransaction={deleteTransaction}
          clearAllTransactions={clearAllTransactions}
          updateTransactionCategory={updateTransactionCategory}
          updateTransactionDetails={updateTransactionDetails}
          addCategory={addCategory}
          removeCategory={removeCategory}
          loading={loading}
          selectedCategoryIds={selectedCategoryIds}
          onCategoryFilterChange={onCategoryFilterChange}
          startDate={startDate}
          endDate={endDate}
          updateDates={updateDates}
        />
      )}

      {/* FAB for mobile */}
      <FAB onClick={() => setIsAddTransactionModalOpen(true)} className="lg:hidden" />

      {/* Add Transaction Modal for mobile */}
      <Modal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        title="Adicionar Nova Transação"
      >
        <AddTransactionForm onClose={() => setIsAddTransactionModalOpen(false)} />
      </Modal>

      {isConfigModalOpen && (
        <ConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          file={uploadedFile}
        />
      )}
    </div>
  );
}
