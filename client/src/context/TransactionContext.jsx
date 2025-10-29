import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { getTransactions, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { processStatement } from '../api/statement';
import { getProfile, updateProfile } from '../api/profile';

const TransactionContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionContext);
};

const toYYYYMMDD = (date) => {
  if (!date) return '';
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

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

        const { start_date, end_date, filtered_categories } = profileRes.data;
        if (start_date && end_date) {
          setStartDate(new Date(start_date));
          setEndDate(new Date(end_date));
        }
        if (filtered_categories) {
          setSelectedCategoryIds(filtered_categories);
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

  // Debounced effect to save preferences to profile
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const handler = setTimeout(() => {
      updateProfile({ 
        start_date: toYYYYMMDD(startDate),
        end_date: toYYYYMMDD(endDate),
        filtered_categories: selectedCategoryIds,
      }).catch(err => console.error("Failed to save preferences:", err));
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [startDate, endDate, selectedCategoryIds, isAuthenticated, loading]);

  const filteredTransactions = useMemo(() => {
    const start = toYYYYMMDD(startDate);
    const end = toYYYYMMDD(endDate);

    const dateFiltered = transactions.filter(t => {
      const transactionDate = t.date;
      return transactionDate >= start && transactionDate <= end;
    });

    if (selectedCategoryIds.length === 0) {
      return dateFiltered;
    }

    return dateFiltered.filter(t => t.category && selectedCategoryIds.includes(t.category.id));

  }, [transactions, startDate, endDate, selectedCategoryIds]);

  const setDateRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  }

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategoryIds(prevIds => 
      prevIds.includes(categoryId) 
        ? prevIds.filter(id => id !== categoryId)
        : [...prevIds, categoryId]
    );
  };

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
    selectedCategoryIds,
    toggleCategoryFilter,
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