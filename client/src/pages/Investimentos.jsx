import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';
import FAB from '../components/shared/FAB';
import OtherInvestmentCard from '../components/Investimentos/OtherInvestmentCard';
import PortfolioChartCard from '../components/Investimentos/PortfolioChartCard';
import AddInvestmentForm from '../components/Investimentos/AddInvestmentForm';
import SavedInvestmentsCard from '../components/Investimentos/SavedInvestmentsCard';
import { useInvestments } from '../context/InvestmentContext';
import { useUtils } from '../context/UtilsContext';

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
  const [isAddInvestmentModalOpen, setIsAddInvestmentModalOpen] = useState(false);
  const location = useLocation();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      console.log("resizing")
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.fromDetailsPage) {
      if (isMobileView) { // Use the state variable here
        setIsAddInvestmentModalOpen(true);
      }
      // If it's desktop, the desktop form will handle it.
    }
    if(!isMobileView) setIsAddInvestmentModalOpen(false);
  }, [location.state, isMobileView]); // Add isMobileView to dependencies

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

  return (
    <div>
      <Header title="Carteira de Investimentos" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {!isMobileView && ( // Conditionally render desktop form
          <div className="hidden lg:block lg:col-span-1">
            <AddInvestmentForm addInvestment={addInvestment} loading={loading} investmentOptions={investmentOptions} />
          </div>
        )}

        <div className="lg:col-span-2">
          <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={"lg:col-span-3"}>
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

      {/* FAB for mobile */}
      <FAB onClick={() => setIsAddInvestmentModalOpen(true)} className="lg:hidden" />

      {/* Add Investment Modal for mobile */}
      <Modal
        isOpen={isAddInvestmentModalOpen}
        onClose={() => setIsAddInvestmentModalOpen(false)}
        title="Adicionar Novo Investimento"
      >
        <AddInvestmentForm 
          addInvestment={addInvestment} 
          loading={loading} 
          investmentOptions={investmentOptions}
          onClose={() => setIsAddInvestmentModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}