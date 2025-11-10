import { useState, useEffect } from 'react';
import Card from '../shared/Card';
import { useRates } from '../../context/RatesContext';
import { Trash2, Calendar, Landmark, TrendingUp, Loader } from 'lucide-react';

const DetailItem = ({ icon: IconComponent, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    {IconComponent && <IconComponent className="w-4 h-4 text-gray-400" />}
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

const calculateBusinessDays = (startDate, endDate) => {
  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};

const OtherInvestmentCard = ({ investment, onRemove }) => {
  const { name, type, details, purchase_date } = investment;
  const { rates, loading: loadingRates } = useRates();
  const [currentValue, setCurrentValue] = useState(null);

  useEffect(() => {
    const calculateCurrentValue = async () => {
      const P = parseFloat(details.invested_amount);
      const startDate = new Date(details.start_date + 'T23:59:59');
      const today = new Date();
      
      const endDate = details.due_date ? new Date(details.due_date + 'T23:59:59') : today;
      const effectiveEndDate = new Date(Math.min(today.getTime(), endDate.getTime()));

      if(effectiveEndDate <= startDate) return;

      switch (details.yield_type) {
        case 'prefixado': {
          const t = (effectiveEndDate - startDate) / (1000 * 60 * 60 * 24 * 365.25); // Time in years
          const r = parseFloat(details.rate) / 100;
          setCurrentValue(P * Math.pow(1 + r, t));
          break;
        }
        case 'posfixado': {
          if (details.indexer) {
            const seriesId = details.indexer === 'CDI' ? 12 : 11;
            const dailyRates = rates[seriesId];

            if (dailyRates) {
              let value = P;
              const ratesMap = new Map(dailyRates.map(rate => {
                const [day, month, year] = rate.data.split('/');
                return [`${year}-${month}-${day}`, parseFloat(rate.valor)];
              }));

              for (let d = new Date(startDate); d <= effectiveEndDate; d.setDate(d.getDate() + 1)) {
                const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                
                if (ratesMap.has(dateString)) {
                  const curRate = ratesMap.get(dateString) / 100;
                  const investmentRate = curRate * (parseFloat(details.indexer_percentage) / 100);
                  value = value * (1 + investmentRate);
                }
              }
              setCurrentValue(value);
            }
          }
          break;
        }
        case 'hibrido': {
          if (details.indexer && details.spread_rate) {
            const seriesId = details.indexer === 'IPCA' ? 433 : 189;
            const monthlyRates = rates[seriesId];

            if (monthlyRates) {
              let inflation_factor = 1;
              if (monthlyRates.length > 0) {
                const applicableRates = monthlyRates.filter(rate => {
                  const [day, month, year] = rate.data.split('/');
                  const inflationDate = new Date(year, month - 1, day);
                  return inflationDate > startDate;
                });

                if (applicableRates.length > 0) {
                  inflation_factor = applicableRates.reduce((acc, rate) => {
                    return acc * (1 + parseFloat(rate.valor) / 100);
                  }, 1);
                }
              }

              const business_days = calculateBusinessDays(startDate, effectiveEndDate);
              const t_util = business_days / 252;
              const spread_rate = parseFloat(details.spread_rate) / 100;
              const fixed_factor = Math.pow(1 + spread_rate, t_util);

              const currentValue = P * inflation_factor * fixed_factor;
              setCurrentValue(currentValue);
            }
          }
          break;
        }
        default:
          break;
      }
    };

    if (!loadingRates) {
      calculateCurrentValue();
    }
  }, [details, rates, loadingRates]);

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(details.invested_amount);

  const formattedCurrentValue = currentValue !== null ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(currentValue) : null;

  const formattedDate = (date) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const renderYieldDetails = () => {
    if (type !== 'renda_fixa' || !details.yield_type) return null;

    let yieldString = '';
    switch (details.yield_type) {
      case 'prefixado':
        yieldString = `${details.rate}% a.a.`;
        break;
      case 'posfixado':
        yieldString = `${details.indexer_percentage}% do ${details.indexer}`;
        break;
      case 'hibrido':
        yieldString = `${details.indexer} + ${details.spread_rate}% a.a.`;
        break;
      default:
        return null;
    }
    return <DetailItem icon={TrendingUp} label="Rentabilidade" value={yieldString} />;
  };

  const typeLabels = {
    renda_fixa: 'Renda Fixa',
    imovel: 'Imóvel',
    ouro: 'Ouro',
    outro: 'Outro',
  };

  return (
    <Card className="p-0 overflow-hidden transition-all hover:shadow-lg">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200">{name}</h4>
          <span className="text-xs font-semibold bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200 px-2 py-1 rounded-full">
            {typeLabels[type] || 'Investimento'}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={() => onRemove(investment.id)}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            aria-label="Remover investimento"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {purchase_date && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Adicionado em: {formattedDate(purchase_date)}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <DetailItem icon={Landmark} label="Emissor/Corretora" value={details.issuer} />
          {details.start_date && <DetailItem icon={Calendar} label="Data de Início" value={formattedDate(details.start_date)} />}
          {details.due_date && <DetailItem icon={Calendar} label="Vencimento" value={formattedDate(details.due_date)} />}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-bold text-gray-800 dark:text-gray-100">{formattedAmount}</span>
          </div>
          {renderYieldDetails()}
          {loadingRates ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : formattedCurrentValue && (
            <div className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-bold text-gray-800 dark:text-gray-100">{formattedCurrentValue}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OtherInvestmentCard;
