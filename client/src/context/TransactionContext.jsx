import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { useUtils } from './UtilsContext';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { processStatement } from '../api/statement';
import { getProfile, updateProfile } from '../api/profile';
import { extractTextFromPDF } from '../api/pdfExtractor'; // Import the new PDF extractor

const TransactionContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionContext);
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const { user, isAuthenticated } = useContext(AuthContext);
  const { startDate, endDate, updateDates, loading: utilsLoading, showNotification } = useUtils();

  const toYYYYMMDD = (date) => {
    if (!date) return '';
    const tempDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
    return tempDate.toISOString().split('T')[0];
  }

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [transactionsData, categoriesData, profileData] = await Promise.all([
          getTransactions(),
          getCategories(),
          getProfile(),
        ]);
        
        // Map categories to a more accessible format for lookup
        const categoriesMap = new Map(categoriesData.map(cat => [cat.id, cat]));

        // Attach full category objects to transactions
        const transactionsWithCategories = transactionsData.map(t => ({
          ...t,
          category: categoriesMap.get(t.category_id) || null,
        }));

        setTransactions(transactionsWithCategories);
        setCategories(categoriesData);

        if (profileData.filtered_categories) {
          setSelectedCategoryIds(profileData.filtered_categories);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data.");
        showNotification("Erro ao carregar os dados. Tente novamente mais tarde.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !utilsLoading) {
      loadData();
    } else if (!isAuthenticated) {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [isAuthenticated, utilsLoading, user, showNotification]);

  // Debounced effect to save preferences to profile
  useEffect(() => {
    if (!isAuthenticated || loading || utilsLoading) return;

    const handler = setTimeout(() => {
      updateProfile({ 
        filtered_categories: selectedCategoryIds,
      }).catch(err => {
        console.error("Failed to save preferences:", err)
        showNotification("Erro ao salvar suas preferências.", "error");
      });
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [selectedCategoryIds, isAuthenticated, loading, utilsLoading, showNotification]);

  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return [];

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
    updateDates(start, end);
  }

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategoryIds(prevIds => 
      prevIds.includes(categoryId) 
        ? prevIds.filter(id => id !== categoryId)
        : [...prevIds, categoryId]
    );
  };

  const handleProcessStatement = async (file) => {
    console.log("Starting handleProcessStatement for file:", file.name);
    try {
      showNotification('Processando extrato...', 'info');
      const extractedText = await extractTextFromPDF(file); // Extract text from PDF
      console.log("PDF text extracted. Sending to API...");
      const newTransactions = await processStatement(extractedText); // Pass extracted text to API
      console.log("API call for processStatement successful. New transactions received:", newTransactions.length);
      if (newTransactions) {
        setTransactions(prev => [...prev, ...newTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data);
      showNotification('Extrato processado e transações adicionadas!', 'success');
    } catch (err) {
      console.error("Error processing statement:", err);
      showNotification('Erro ao processar extrato.', 'error');
      throw err;
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const newTransaction = await createTransaction(transactionData);
      // Find the full category object based on the category_id
      const category = categories.find(c => c.id === newTransaction.category_id);
      const transactionWithCategory = { ...newTransaction, category };
      setTransactions(prev => [...prev, transactionWithCategory].sort((a, b) => new Date(b.date) - new Date(a.date)));
      showNotification("Transação adicionada com sucesso!", "success");
      return transactionWithCategory;
    } catch (err) {
      console.error("Error adding transaction:", err);
      showNotification("Erro ao adicionar transação.", "error");
      throw err;
    }
  };

  const handleDeleteTransaction = async (id) => {
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTransaction(id);
      showNotification("Transação excluída com sucesso!", "success");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setTransactions(originalTransactions);
      showNotification("Erro ao excluir transação.", "error");
    }
  };

  const handleUpdateTransactionCategory = async (id, categoryId) => {
    const originalTransactions = [...transactions];
    const category = categories.find(c => c.id === categoryId);
    setTransactions(prev => 
      prev.map(t => (t.id === id ? { ...t, category } : t))
    );
    try {
      await updateTransaction(id, { category_id: categoryId, category: category }); // Storing full category object for now
      showNotification("Categoria da transação atualizada!", "success");
    } catch (err) {
      console.error("Error updating transaction category:", err);
      setTransactions(originalTransactions);
      showNotification("Erro ao atualizar a categoria.", "error");
    }
  };

  const updateTransactionDetails = async (id, data) => {
    const originalTransactions = [...transactions];
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...data } : t))
    );
    try {
      await updateTransaction(id, data);
      showNotification("Transação atualizada com sucesso!", "success");
    } catch (err) {
      console.error("Error updating transaction:", err);
      setTransactions(originalTransactions);
      showNotification("Erro ao atualizar a transação.", "error");
      throw err;
    }
  };

  const handleAddCategory = async (name) => {
    try {
      const newCategory = await createCategory({ name });
      setCategories(prev => [...prev, newCategory]);
      showNotification("Categoria adicionada com sucesso!", "success");
    } catch (err) {
      console.error("Error adding category:", err);
      showNotification("Erro ao adicionar categoria.", "error");
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
      showNotification("Categoria removida com sucesso!", "success");
    } catch (err) {
      console.error("Error deleting category:", err);
      setCategories(originalCategories);
      showNotification("Erro ao remover categoria.", "error");
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
    addTransaction: handleAddTransaction,
    deleteTransaction: handleDeleteTransaction,
    updateTransactionCategory: handleUpdateTransactionCategory,
    updateTransactionDetails,
    addCategory: handleAddCategory,
    removeCategory: handleRemoveCategory,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};