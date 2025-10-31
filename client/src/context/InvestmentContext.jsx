import { createContext, useState, useEffect, useContext } from 'react';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../api/investments';
import { AuthContext } from './AuthContext';

const InvestmentContext = createContext();

export const useInvestments = () => useContext(InvestmentContext);

export const InvestmentProvider = ({ children }) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      setInvestments([]);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getInvestments();
        setInvestments(res.data);
        setError(null);
      } catch {
        setError('Erro ao carregar investimentos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const addInvestment = async (investment) => {
    try {
      const res = await createInvestment(investment);
      setInvestments(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      setError('Erro ao adicionar investimento.');
      // Diagnostic log for backend response
      if (err.response) {
        console.error('Investment API error:', err.response.data);
      }
      throw err;
    }
  };

  const editInvestment = async (id, updates) => {
    try {
      const res = await updateInvestment(id, updates);
      setInvestments(prev => prev.map(inv => inv.id === id ? res.data : inv));
      return res.data;
    } catch (err) {
      setError('Erro ao atualizar investimento.');
      throw err;
    }
  };

  const removeInvestment = async (id) => {
    const original = investments;
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    try {
      await deleteInvestment(id);
    } catch {
      setInvestments(original);
      setError('Erro ao excluir investimento.');
    }
  };

  return (
    <InvestmentContext.Provider value={{ investments, loading, error, addInvestment, editInvestment, removeInvestment }}>
      {children}
    </InvestmentContext.Provider>
  );
};
