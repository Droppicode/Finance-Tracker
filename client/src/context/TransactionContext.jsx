import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { getTransactions, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { processStatement } from '../api/statement';
import { getProfile, updateProfile } from '../api/profile';

const TransactionContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionContext);
};

// Helper to get date strings in YYYY-MM-DD format
const toYYYYMMDD = (date) => {
  if (!date) return '';
  // Adjust for timezone offset before converting to ISO string
  const tempDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
  return tempDate.toISOString().split('T')[0];
}

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });

  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, categoriesRes, profileRes] = await Promise.all([
          getTransactions(),
          getCategories(),
          getProfile(),
        ]);
        
        setTransactions(transactionsRes.data);
        setCategories(categoriesRes.data);

        // Set dates from profile if they exist
        const { start_date, end_date } = profileRes.data;
        if (start_date && end_date) {
          setStartDate(new Date(start_date));
          setEndDate(new Date(end_date));
        }

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
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Debounced effect to save date range to profile
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const handler = setTimeout(() => {
      updateProfile({ 
        start_date: toYYYYMMDD(startDate),
        end_date: toYYYYMMDD(endDate),
      }).catch(err => console.error("Failed to save date range:", err));
    }, 1000); // Save 1 second after the last change

    return () => {
      clearTimeout(handler);
    };
  }, [startDate, endDate, isAuthenticated, loading]);

  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return transactions;
    
    const start = toYYYYMMDD(startDate);
    const end = toYYYYMMDD(endDate);

    return transactions.filter(t => {
      const transactionDate = t.date;
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, startDate, endDate]);

  const setDateRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  }

  const handleProcessStatement = async (file) => {
    try {
      const response = await processStatement(file);
      const newTransactions = response.data;
      setTransactions(prev => [...prev, ...newTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Error processing statement:", err);
      throw err;
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
    transactions: filteredTransactions,
    categories,
    loading,
    error,
    startDate,
    endDate,
    setDateRange,
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
