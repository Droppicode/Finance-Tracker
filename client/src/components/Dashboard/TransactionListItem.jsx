import React, { useState } from 'react';
import { Trash2, ChevronDown, Edit } from 'lucide-react';
import EditableTableCell from './EditableTableCell'; // Assuming this is also in the same Dashboard folder
import CategoryManager from './CategoryManager'; // Assuming this is also in the same Dashboard folder

const TransactionListItem = ({
  transaction,
  categories,
  deleteTransaction,
  updateTransactionCategory,
  updateTransactionDetails,
  addCategory,
  removeCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const handleCategoryChange = async (id, newCategoryId) => {
    await updateTransactionCategory(id, newCategoryId);
    setEditingCategoryId(null);
  };

  const toggleCategoryEditor = (id) => {
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
    } else {
      setEditingCategoryId(id);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 shadow-lg rounded-lg p-4 mb-3">
      <div className="flex justify-between items-center" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-300">{transaction.date}</span>
          <span className="font-medium text-gray-900 dark:text-white">{transaction.description}</span>
        </div>
        <div className="flex items-center">
          <span className={`font-semibold text-lg ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {transaction.type === 'debit' ? '- ' : '+ '}R$ {transaction.amount.toFixed(2)}
          </span>
          <ChevronDown className={`w-5 h-5 ml-2 transition-transform text-gray-500 dark:text-gray-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Descrição</label>
            <EditableTableCell value={transaction.description} onSave={(newValue) => updateTransactionDetails(transaction.id, { description: newValue })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Valor (R$)</label>
            <EditableTableCell
              value={transaction.amount}
              onSave={(newValue) => updateTransactionDetails(transaction.id, { amount: newValue })}
              cellType="number"
              transactionType={transaction.type}
              onTypeChange={(newType) => updateTransactionDetails(transaction.id, { type: newType })}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => toggleCategoryEditor(transaction.id)}
                className="flex-grow flex items-center justify-between cursor-pointer p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span>{transaction.category?.name || 'Selecione uma categoria...'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <button onClick={() => deleteTransaction(transaction.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {editingCategoryId === transaction.id && categories && (
              <CategoryManager
                categories={categories.map(c => ({ value: c.id, label: c.name }))}
                onSelectCategory={(category) => handleCategoryChange(transaction.id, category)}
                onAddCategory={addCategory}
                onRemoveCategory={removeCategory}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionListItem;
