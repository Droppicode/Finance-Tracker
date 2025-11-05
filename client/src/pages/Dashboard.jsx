import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';

import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
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
    toggleCategoryFilter,
  } = useTransactions();

  const { startDate, endDate, updateDates } = useUtils();

  return (
    <div>
      <Header title="Dashboard" />
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-gray-200 dark:md:divide-gray-700">
          <StatementUploadCard processStatement={processStatement} />
          <div className="md:pl-8">
            <AddTransactionForm />
          </div>
        </div>
      </Card>

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
          toggleCategoryFilter={toggleCategoryFilter}
          startDate={startDate}
          endDate={endDate}
          updateDates={updateDates}
        />
      )}
    </div>
  );

}