import { createContext, useState, useEffect, useContext } from 'react';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment, getOtherInvestments, createOtherInvestment, deleteOtherInvestment } from '../api/investments';
import { AuthContext } from './AuthContext';
import { useUtils } from './UtilsContext';

const InvestmentContext = createContext();

export const useInvestments = () => useContext(InvestmentContext);

export const InvestmentProvider = ({ children }) => {
  const [investments, setInvestments] = useState([]);
  const [otherInvestments, setOtherInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useUtils();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setInvestments([]);
      setOtherInvestments([]);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const investmentsData = await getInvestments();
        setInvestments(investmentsData);
        const otherInvestmentsData = await getOtherInvestments();
        setOtherInvestments(otherInvestmentsData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar investimentos.');
        showNotification('Erro ao carregar investimentos.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user]);

  const addInvestment = async (investment) => {
    try {
      const newInvestment = await createInvestment(investment);
      setInvestments(prev => [...prev, newInvestment]);
      showNotification('Investimento adicionado com sucesso!', 'success');
      return newInvestment;
    } catch (err) {
      setError('Erro ao adicionar investimento.');
      showNotification('Erro ao adicionar investimento.', 'error');
      console.error('Investment API error:', err);
      throw err;
    }
  };

  const addOtherInvestment = async (investment) => {
    try {
      const newOtherInvestment = await createOtherInvestment(investment);
      setOtherInvestments(prev => [...prev, newOtherInvestment]);
      showNotification('Investimento adicionado com sucesso!', 'success');
      return newOtherInvestment;
    } catch (err) {
      setError('Erro ao adicionar outro investimento.');
      showNotification('Erro ao adicionar outro investimento.', 'error');
      console.error('Other Investment API error:', err);
      throw err;
    }
  };

  const editInvestment = async (id, updates) => {
    try {
      await updateInvestment(id, updates);
      const updatedInvestment = { ...investments.find(inv => inv.id === id), ...updates };
      setInvestments(prev => prev.map(inv => inv.id === id ? updatedInvestment : inv));
      showNotification('Investimento atualizado com sucesso!', 'success');
      return updatedInvestment;
    } catch (err) {
      setError('Erro ao atualizar investimento.');
      showNotification('Erro ao atualizar investimento.', 'error');
      throw err;
    }
  };

  const removeInvestment = async (id) => {
    const original = investments;
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    try {
      await deleteInvestment(id);
      showNotification('Investimento removido com sucesso!', 'success');
    } catch {
      setInvestments(original);
      setError('Erro ao excluir investimento.');
      showNotification('Erro ao excluir investimento.', 'error');
    }
  };

  const removeOtherInvestment = async (id) => {
    const original = otherInvestments;
    setOtherInvestments(prev => prev.filter(inv => inv.id !== id));
    try {
      await deleteOtherInvestment(id);
      showNotification('Investimento removido com sucesso!', 'success');
    }
 catch {
      setOtherInvestments(original);
      setError('Erro ao excluir outro investimento.');
      showNotification('Erro ao excluir outro investimento.', 'error');
    }
  };

  return (
    <InvestmentContext.Provider value={{ investments, otherInvestments, loading, error, addInvestment, addOtherInvestment, editInvestment, removeInvestment, removeOtherInvestment }}>
      {children}
    </InvestmentContext.Provider>
  );
};
