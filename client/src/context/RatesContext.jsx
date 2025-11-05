
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getRates } from '../api/indexes';
import { useInvestments } from './InvestmentContext';

const RatesContext = createContext();

export const useRates = () => useContext(RatesContext);

export const RatesProvider = ({ children }) => {
  const { otherInvestments } = useInvestments();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

  const relevantInvestments = useMemo(() => 
    otherInvestments.filter(inv => inv.details.yield_type === 'posfixado' || inv.details.yield_type === 'hibrido'),
    [otherInvestments]
  );

  useEffect(() => {
    const fetchAllRates = async () => {
      if (relevantInvestments.length === 0) return;

      setLoading(true);
      const newRates = {};

      const seriesToFetch = new Map();

      relevantInvestments.forEach(inv => {
        const { start_date, due_date, yield_type, indexer } = inv.details;
        let seriesId;
        let frequency = 'daily';

        if (yield_type === 'posfixado') {
          seriesId = indexer === 'CDI' ? 12 : 11;
        } else if (yield_type === 'hibrido') {
          seriesId = indexer === 'IPCA' ? 433 : 189;
          frequency = 'monthly';
        }

        if (seriesId) {
          if (!seriesToFetch.has(seriesId)) {
            seriesToFetch.set(seriesId, { startDate: start_date, endDate: due_date, frequency: frequency, seriesId: seriesId });
          } else {
            const existing = seriesToFetch.get(seriesId);
            if (new Date(start_date) < new Date(existing.startDate)) {
              existing.startDate = start_date;
            }
            if (new Date(due_date) > new Date(existing.endDate)) {
              existing.endDate = due_date;
            }
          }
        }
      });

      try {
        await Promise.all(
          Array.from(seriesToFetch.values()).map(async ({ seriesId, startDate, endDate, frequency }) => {
            const data = await getRates(seriesId, startDate, endDate, frequency);
            newRates[seriesId] = data;
          })
        );
        setRates(newRates);
      } catch (error) {
        console.error("Failed to fetch rates", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRates();
  }, [relevantInvestments]);

  const value = {
    rates,
    loading,
  };

  return (
    <RatesContext.Provider value={value}>
      {children}
    </RatesContext.Provider>
  );
};
