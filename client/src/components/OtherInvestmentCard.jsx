
import { Trash2, Calendar, Landmark, TrendingUp, Percent, FileText, Hash } from 'lucide-react';

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

const OtherInvestmentCard = ({ investment, onRemove }) => {
  const { name, type, details, purchase_date } = investment;

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(details.invested_amount);

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
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
        </div>
      </div>
    </div>
  );
};

export default OtherInvestmentCard;
