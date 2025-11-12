import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';

import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';
import FAB from '../components/shared/FAB';
import CollapsibleCard from '../components/shared/CollapsibleCard';
import AddTransactionForm from '../components/Dashboard/AddTransactionForm';
import StatementUploadCard from '../components/Dashboard/StatementUploadCard';
import TransactionsCard from '../components/Dashboard/TransactionsCard';

export default function DashboardPage() {
  const {
    transactions,
    categories,
    processStatement,
    deleteTransaction,
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

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Collapsible Card for small screens */}
        <div className="lg:col-span-1 lg:hidden">
          <CollapsibleCard title="Upload de Extrato (PDF)" defaultOpen={false}>
            <StatementUploadCard processStatement={processStatement} />
          </CollapsibleCard>
        </div>
        {/* Regular Card for large screens */}
        <div className="lg:col-span-1 hidden lg:block h-full">
          <Card className="flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Upload de Extrato (PDF)</h2>
            <StatementUploadCard processStatement={processStatement} className="flex-grow" />
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
    </div>
  );
}
