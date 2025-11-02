import { createContext, useContext, useState, useEffect } from 'react';
import { getIndexes } from '../api/indexes';

const IndexContext = createContext();

export const useIndexes = () => {
  return useContext(IndexContext);
};

export const IndexProvider = ({ children }) => {
  const [indexes, setIndexes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const data = await getIndexes();
        setIndexes(data);
      } catch (error) {
        console.error("Failed to fetch indexes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndexes();
  }, []);

  const value = {
    indexes,
    loading,
  };

  return (
    <IndexContext.Provider value={value}>
      {children}
    </IndexContext.Provider>
  );
};
