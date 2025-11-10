import { useState, useMemo } from 'react';
import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import OtherInvestmentCard from '../components/Investimentos/OtherInvestmentCard';
import PortfolioChartCard from '../components/Investimentos/PortfolioChartCard';
import AddInvestmentForm from '../components/Investimentos/AddInvestmentForm';
import SavedInvestmentsCard from '../components/Investimentos/SavedInvestmentsCard';
import InvestmentDetailsCard from '../components/Investimentos/InvestmentDetailsCard';
import { useInvestments } from '../context/InvestmentContext';
import { useUtils } from '../context/UtilsContext';
import { getQuote } from '../api/brapi';

const investmentOptions = [
  { value: 'stock', label: 'Ações' },
  { value: 'fund', label: 'FIIs' },
  { value: 'etf', label: 'ETFs' },
  { value: 'bdr', label: 'BDRs' },
  { value: 'index', label: 'Índices' },
  { value: 'criptomoedas', label: 'Criptomoedas' },
  { value: 'outros', label: 'Outros' },
];

const labelFromType = (type) => investmentOptions.find(o => o.value === type)?.label || 'Outros';

export default function InvestimentosPage() {
  const { investments, otherInvestments, addInvestment, removeInvestment, removeOtherInvestment, loading } = useInvestments();
  const { startDate, endDate, updateDates } = useUtils();
  const [assetQuote, setAssetQuote] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, { quantity, price }) => acc + (parseFloat(quantity) * parseFloat(price)), 0);
  }, [investments]);

  const chartData = useMemo(() => {
    const map = {};
    investments.forEach(inv => {
      const t = inv.type || 'outros';
      map[t] = (map[t] || 0) + (parseFloat(inv.quantity) * parseFloat(inv.price));
    });
    return Object.entries(map).map(([type, value]) => ({ name: labelFromType(type), value }));
  }, [investments]);

  const handleSelectInvestment = async (investment) => {
    try {
      const quote = await getQuote(investment.stock);
      setAssetQuote(quote);
      return quote;
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
      return null;
    }
  };

  return (
    <div>
      <Header title="Carteira de Investimentos" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <AddInvestmentForm addInvestment={addInvestment} loading={loading} investmentOptions={investmentOptions} onSelectInvestment={handleSelectInvestment} />
        </div>

        {assetQuote ? (
          <InvestmentDetailsCard assetQuote={assetQuote} showChart={showChart} setShowChart={setShowChart} />
        ) : (
          <div className="lg:col-span-2">
            <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={assetQuote ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="h-[38rem] lg:relative lg:col-span-2">
            <SavedInvestmentsCard
              investments={investments}
              removeInvestment={removeInvestment}
              loading={loading}
              investmentOptions={investmentOptions}
              startDate={startDate}
              endDate={endDate}
              updateDates={updateDates}
              labelFromType={labelFromType}
            />
          </div>
        </div>

        {assetQuote && (
          <div className="lg:col-span-1">
            <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
          </div>
        )}
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Outros Investimentos</h3>
          {otherInvestments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum outro investimento salvo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherInvestments.map(inv => (
                <OtherInvestmentCard 
                  key={inv.id} 
                  investment={inv} 
                  onRemove={removeOtherInvestment} 
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}