import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { getStatementConfigs, saveStatementConfig, deleteStatementConfig } from '../api/statementConfigs';

const ConfigContext = createContext();

export const useConfigs = () => useContext(ConfigContext);

const initialColumn = (id, name, enabled = true) => ({ id, name, enabled, bbox: null, bbox_debit: null, bbox_credit: null });
export const initialConfig = {
  name: 'Nova Configuração',
  columns: [
    initialColumn('date', 'Data'),
    initialColumn('description', 'Descrição'),
    initialColumn('value', 'Valor'),
    initialColumn('balance', 'Saldo', false),
  ],
  valueFormat: 'single_column_sign',
  hasHeader: true,
  tableYBbox: null,
};


export const ConfigProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfigs = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        setError(null);
        const userConfigs = await getStatementConfigs(user.uid);
        setConfigs(userConfigs);
        if (userConfigs.length > 0) {
          setSelectedConfigId(userConfigs[0].id);
        } else {
          setSelectedConfigId(null);
        }
      } catch (e) {
        console.error("Error fetching statement configs:", e);
        setError("Falha ao carregar as configurações de extrato.");
      } finally {
        setLoading(false);
      }
    } else {
      setConfigs([]);
      setSelectedConfigId(null);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const saveConfig = async (configData) => {
    if (!user) {
      throw new Error("User not authenticated.");
    }
    
    // If configData has an ID, it's an update. If not, it's a new one.
    const configId = configData.id || Date.now().toString();
    const newConfigData = { ...configData };
    if (!newConfigData.id) {
        newConfigData.id = configId;
    }

    try {
      setLoading(true);
      await saveStatementConfig(user.uid, configId, newConfigData);
      await fetchConfigs(); // Refresh list
      setSelectedConfigId(configId); // Select the newly saved config
    } catch (e) {
      console.error("Error saving config:", e);
      setError("Falha ao salvar a configuração.");
    } finally {
        setLoading(false);
    }
  };

  const deleteConfig = async (configId) => {
    if (!user) {
        throw new Error("User not authenticated.");
    }
    try {
        setLoading(true);
        await deleteStatementConfig(user.uid, configId);
        await fetchConfigs(); // Refresh list
    } catch (e) {
        console.error("Error deleting config:", e);
        setError("Falha ao deletar a configuração.");
    } finally {
        setLoading(false);
    }
  };

  const selectedConfig = configs.find(c => c.id === selectedConfigId) || null;

  const value = {
    configs,
    selectedConfig,
    selectedConfigId,
    setSelectedConfigId,
    saveConfig,
    deleteConfig,
    loading,
    error,
    fetchConfigs,
    initialConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
