import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { useUtils } from './UtilsContext';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, classifyTransactions } from '../api/transactions';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
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
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

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
      return dateFiltered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return dateFiltered.filter(t => t.category && selectedCategoryIds.includes(t.category.id)).sort((a, b) => new Date(b.date) - new Date(a.date));

  }, [transactions, startDate, endDate, selectedCategoryIds]);

  const setDateRange = (start, end) => {
    updateDates(start, end);
  }

  const parseBrazilianDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;

    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!parts) {
      // Try to parse directly if it's not in DD/MM/YYYY format
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        return d;
      }
      return null;
    }
    
    // parts will be [full_match, DD, MM, YYYY]
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[3], 10);
    
    const date = new Date(year, month, day);

    // Check if the created date is valid and the parts match
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }

    return null;
  };

  const handleProcessStatement = async (file, config) => {
    console.log("DEBUG: Starting handleProcessStatement for file:", file.name, "with config:", config);
    try {
      showNotification('Processando extrato...', 'info');
      
      // Step 1: Extract transactions from PDF.
      const extractedTransactions = await extractTextFromPDF(file, config);
      console.log("DEBUG: Extracted transactions from PDF:", extractedTransactions);

      if (!extractedTransactions || extractedTransactions.length === 0) {
        showNotification('Nenhuma transação encontrada no extrato.', 'info');
        return;
      }

      // Step 2: Classify transactions.
      showNotification('Classificando transações...', 'info');
      const descriptions = extractedTransactions.map(t => t.description);
      console.log("DEBUG: Sending descriptions for classification:", descriptions);
      
      const classificationResults = await classifyTransactions(descriptions);
      console.log("DEBUG: Received classification results:", classificationResults);
      
      // Create a map for easy lookup of classification results by description
      const resultMap = new Map(classificationResults.map(r => [r.description, { category: r.category, confidence: r.confidence }]));

      // Step 3: Merge classification results and sanitize data.
      const newTransactionsFromAI = extractedTransactions.map(t => {
        const result = resultMap.get(t.description);
        const category = result && result.confidence >= 0.35 ? result.category : 'Outros';

        const parsedDate = parseBrazilianDate(t.date);
        if (!parsedDate) {
            console.warn(`DEBUG: Invalid date format for transaction: '${t.description}'. Using today's date as fallback. Original date was:`, t.date);
        }
        const transactionDate = parsedDate ? parsedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const sanitizedValue = t.value;

        return {
            ...t,
            category: category,
            date: transactionDate,
            amount: sanitizedValue,
            type: sanitizedValue < 0 ? 'debit' : 'credit' 
        }
      });
      console.log("DEBUG: Merged and sanitized transactions:", newTransactionsFromAI);

      // Step 4: Get existing categories and find new ones to create.
      let allCategories = await getCategories();
      const categoryNameToIdMap = new Map(allCategories.map(c => [c.name, c.id]));
      const newCategoryNames = [...new Set(newTransactionsFromAI.map(t => t.category).filter(Boolean))];
      const categoriesToCreate = newCategoryNames.filter(name => !categoryNameToIdMap.has(name));
      
      console.log("DEBUG: New categories to create:", categoriesToCreate);

      if (categoriesToCreate.length > 0) {
        for (const name of categoriesToCreate) {
          await createCategory({ name });
        }
        allCategories = await getCategories(); // Refresh categories
      }
      
      setCategories(allCategories);
      const updatedCategoryNameToObjMap = new Map(allCategories.map(c => [c.name, c]));

      // Step 5: Prepare transactions for database insertion.
      const transactionsToCreate = newTransactionsFromAI.map(t => {
        const category = updatedCategoryNameToObjMap.get(t.category);
        return {
          description: t.description,
          amount: Math.abs(t.amount), // Amount should be positive
          date: t.date,
          type: t.type,
          category_id: category ? category.id : null,
        };
      });
      console.log("DEBUG: Transactions prepared for creation:", transactionsToCreate);

      // Step 6: Create transactions in the backend.
      const createdTransactions = [];
      for (const t of transactionsToCreate) {
        const newTrans = await createTransaction(t);
        createdTransactions.push(newTrans);
      }
      console.log("DEBUG: Transactions created in DB:", createdTransactions);

      // Step 7: Update local state.
      const categoryIdToObjMap = new Map(allCategories.map(c => [c.id, c]));
      const newTransactionsWithCategory = createdTransactions.map(t => ({
        ...t,
        category: categoryIdToObjMap.get(t.category_id) || null
      }));

      setTransactions(prev => {
        const combined = [...prev, ...newTransactionsWithCategory];
        const unique = Array.from(new Map(combined.map(t => [t.id, t])).values());
        return unique.sort((a, b) => new Date(b.date) - new Date(a.date));
      });

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

  const handleClearAllTransactions = async () => {
    const originalTransactions = [...transactions];
    showNotification('Limpando todas as transações...', 'info');
    // Optimistically update the UI
    setTransactions([]);

    try {
      // Create a list of deletion promises
      const deletionPromises = originalTransactions.map(t => deleteTransaction(t.id));
      // Wait for all deletions to complete
      await Promise.all(deletionPromises);
      showNotification('Todas as transações foram removidas!', 'success');
    } catch (err) {
      console.error("Error clearing all transactions:", err);
      showNotification('Ocorreu um erro ao limpar as transações. Restaurando dados.', 'error');
      // Rollback UI on error
      setTransactions(originalTransactions);
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
    onCategoryFilterChange: setSelectedCategoryIds,
    processStatement: handleProcessStatement,
    addTransaction: handleAddTransaction,
    deleteTransaction: handleDeleteTransaction,
    clearAllTransactions: handleClearAllTransactions,
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