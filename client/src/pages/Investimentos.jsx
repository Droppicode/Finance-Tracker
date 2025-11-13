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
import InvestmentDetailsCard from '../components/Investimentos/InvestmentDetailsCard'; // Import InvestmentDetailsCard
import { useInvestments } from '../context/InvestmentContext';
import { useUtils } from '../context/UtilsContext';
import { X } from 'lucide-react'; // Import X icon

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
  const [formType, setFormType] = useState('market');
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

  const [selectedAsset, setSelectedAsset] = useState(null); // New state for selected asset

  const handleInvestmentSelection = (asset) => {
    setSelectedAsset(asset);
  };

  const clearSelectedInvestment = () => {
    setSelectedAsset(null);
  };

  return (
    <div>
      <Header title="Carteira de Investimentos" />

      {/* Desktop Layout */}
      {!isMobileView ? (
        <>
          {/* First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Coluna do Formulário */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Adicionar Investimento</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFormType('market')} className={`px-3 py-1 text-sm rounded-md ${formType === 'market' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Mercado</button>
                    <button onClick={() => setFormType('other')} className={`px-3 py-1 text-sm rounded-md ${formType === 'other' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Outros</button>
                  </div>
                </div>
                <AddInvestmentForm
                  addInvestment={addInvestment}
                  loading={loading}
                  investmentOptions={investmentOptions}
                  formType={formType}
                  onInvestmentSelected={handleInvestmentSelection} // Pass handler
                />
              </Card>
            </div>

            {/* Coluna de Detalhes do Ativo ou Gráfico de Alocação */}
            {selectedAsset ? (
              <div className="lg:col-span-2">
                <InvestmentDetailsCard assetQuote={selectedAsset} onClose={clearSelectedInvestment} isEmbedded={true} />
              </div>
            ) : (
              <div className="lg:col-span-2">
                <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
              </div>
            )}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {selectedAsset ? (
              <>
                <div className="lg:col-span-2 h-[38rem] lg:relative">
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
                <div className="lg:col-span-1">
                  <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
                </div>
              </>
            ) : (
              <div className="lg:col-span-3 h-[38rem] lg:relative">
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
            )}
          </div>
        </>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <PortfolioChartCard chartData={chartData} totalInvested={totalInvested} />
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
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
        </>
      )}

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
        title="Adicionar Investimento"
      >
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setFormType('market')} className={`px-3 py-1 text-sm rounded-md ${formType === 'market' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Mercado</button>
          <button onClick={() => setFormType('other')} className={`px-3 py-1 text-sm rounded-md ${formType === 'other' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Outros</button>
        </div>
        <AddInvestmentForm 
          addInvestment={addInvestment} 
          loading={loading} 
          investmentOptions={investmentOptions}
          onClose={() => setIsAddInvestmentModalOpen(false)}
          formType={formType}
        />
      </Modal>
    </div>
  );
}