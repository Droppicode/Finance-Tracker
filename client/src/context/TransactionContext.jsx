import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getTransactions, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { processStatement } from '../api/statement';

const TransactionContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionContext);
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, categoriesRes] = await Promise.all([
          getTransactions(),
          getCategories(),
        ]);
        setTransactions(transactionsRes.data);
        setCategories(categoriesRes.data);
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      // Clear data when user is not authenticated (e.g., on logout)
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleProcessStatement = async (file) => {
    try {
      const response = await processStatement(file);
      const newTransactions = response.data; // Assuming API returns { data: [...] }
      setTransactions(prev => [...prev, ...newTransactions]);
      // Re-fetch categories in case new ones were created
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Error processing statement:", err);
      throw err; // Re-throw to be caught in the component
    }
  };

  const handleDeleteTransaction = async (id) => {
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTransaction(id);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setTransactions(originalTransactions);
    }
  };

  const handleUpdateTransactionCategory = async (id, categoryId) => {
    const originalTransactions = [...transactions];
    const category = categories.find(c => c.id === categoryId);
    setTransactions(prev => 
      prev.map(t => (t.id === id ? { ...t, category } : t))
    );
    try {
      await updateTransaction(id, { category_id: categoryId });
    } catch (err) {
      console.error("Error updating transaction category:", err);
      setTransactions(originalTransactions);
    }
  };

  const handleAddCategory = async (name) => {
    try {
      const response = await createCategory({ name });
      setCategories(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleRemoveCategory = async (id) => {
    const originalCategories = [...categories];
    setCategories(prev => prev.filter(c => c.id !== id));
    setTransactions(prev => 
      prev.map(t => (t.category?.id === id ? { ...t, category: null } : t))
    );
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error("Error deleting category:", err);
      setCategories(originalCategories);
    }
  };

  const value = {
    transactions,
    categories,
    loading,
    error,
    processStatement: handleProcessStatement,
    deleteTransaction: handleDeleteTransaction,
    updateTransactionCategory: handleUpdateTransactionCategory,
    addCategory: handleAddCategory,
    removeCategory: handleRemoveCategory,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
