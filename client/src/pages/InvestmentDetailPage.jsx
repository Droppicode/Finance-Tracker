import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/shared/Header';
import InvestmentDetailsCard from '../components/Investimentos/InvestmentDetailsCard';
import { getQuote } from '../api/brapi';
import { ArrowLeft } from 'lucide-react';

export default function InvestmentDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assetQuote, setAssetQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const originalAssetFromForm = location.state?.asset;

  useEffect(() => {
    const fetchQuote = async () => {
      if (!symbol) return;
      setLoading(true);
      setError(null);
      try {
        const quote = await getQuote(symbol);
        setAssetQuote(quote);
      } catch (err) {
        console.error("Erro ao buscar cotação do ativo:", err);
        setError("Não foi possível carregar os dados do ativo.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol]);

  const handleGoBack = () => {
    if (location.state?.fromAddInvestmentForm) {
      const returnAsset = {
        ...originalAssetFromForm,
        ...assetQuote,
        stock: originalAssetFromForm?.stock || assetQuote?.symbol,
        name: originalAssetFromForm?.name || assetQuote?.longName,
        type: originalAssetFromForm?.type
      };
      
      navigate('/investimentos', { state: { fromDetailsPage: true, asset: returnAsset } });
    } else {
      navigate('/investimentos');
    }
  };

  return (
    <div>
      <Header title={assetQuote?.longName || symbol} />
      
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Voltar para a lista
            </button>
      {loading && <p className="text-gray-800 dark:text-gray-100">Carregando detalhes do ativo...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {assetQuote && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <InvestmentDetailsCard 
              assetQuote={assetQuote} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
