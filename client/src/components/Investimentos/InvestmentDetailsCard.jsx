import Card from '../shared/Card';
import Button from '../shared/Button';
import AssetChart from './AssetChart';
import { Info, AreaChart } from 'lucide-react';

export default function InvestmentDetailsCard({ assetQuote, showChart, setShowChart }) {
  return (
    <div className="h-[30rem] lg:h-auto lg:relative lg:col-span-2">
      <Card className="h-full lg:absolute lg:inset-0 flex flex-col">
        <div className={`flex-1 min-h-0 ${!showChart ? 'overflow-y-auto' : 'flex flex-col overflow-x-auto'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {assetQuote.logourl && (
                <img src={assetQuote.logourl} alt={`${assetQuote.symbol} logo`} className="w-10 h-10 mr-3" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{assetQuote.symbol}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{assetQuote.longName || assetQuote.shortName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChart(!showChart)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showChart ? <Info className="w-5 h-5" /> : <AreaChart className="w-5 h-5" />}
            </Button>
          </div>

          {showChart ? (
            <AssetChart symbol={assetQuote.symbol} />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-400">Preço Atual</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {assetQuote.regularMarketPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className={`text-xl font-bold ${parseFloat(assetQuote.regularMarketChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {!isNaN(parseFloat(assetQuote.regularMarketChange)) ? parseFloat(assetQuote.regularMarketChange).toFixed(2) : 'N/A'} ({!isNaN(parseFloat(assetQuote.regularMarketChangePercent)) ? parseFloat(assetQuote.regularMarketChangePercent).toFixed(2) : 'N/A'}%)
                </p>
              </div>

              <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Desempenho do Dia</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <p className="text-gray-400 text-sm">Abertura:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketOpen?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-gray-400 text-sm">Máxima do Dia:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketDayHigh?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-gray-400 text-sm">Mínima do Dia:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketDayLow?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-gray-400 text-sm">Fechamento Anterior:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketPreviousClose?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-gray-400 text-sm">Volume:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.regularMarketVolume?.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Período de 52 Semanas</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <p className="text-gray-400 text-sm">Máxima 52 Semanas:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekHigh?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-gray-400 text-sm">Mínima 52 Semanas:</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.fiftyTwoWeekLow?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>

              {(assetQuote.marketCap || assetQuote.priceEarnings) && (
                <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Outras Métricas</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {assetQuote.marketCap && (
                      <>
                        <p className="text-gray-400 text-sm">Valor de Mercado:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.marketCap?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</p>
                      </>
                    )}
                    {assetQuote.priceEarnings && (
                      <>
                        <p className="text-gray-400 text-sm">P/L:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{assetQuote.priceEarnings?.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {assetQuote.regularMarketTime && (
                <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4 text-right text-xs text-gray-500 dark:text-gray-400">
                  Última atualização: {new Date(assetQuote.regularMarketTime).toLocaleString('pt-BR')}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
