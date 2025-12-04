import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Select from '../shared/Select';
import Input from '../shared/Input';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const initialColumn = (id, name, enabled = true) => ({ id, name, enabled, bbox: null });
const initialConfig = {
  columns: [
    initialColumn('date', 'Data'),
    initialColumn('description', 'Descrição'),
    initialColumn('value', 'Valor'),
    initialColumn('balance', 'Saldo', false),
  ],
  valueFormat: 'single_column_sign', // or 'debit_credit_columns'
  hasHeader: true,
  tableYBbox: null,
};

export default function ConfigModal({ isOpen, onClose, file, onSave, currentConfig }) {
  const [step, setStep] = useState(1);
  const [pageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [config, setConfig] = useState(currentConfig || initialConfig);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const pageRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState(null);

  const [selectingColumnIndex, setSelectingColumnIndex] = useState(0);
  const enabledColumns = useMemo(() => config.columns.filter(c => c.enabled), [config.columns]);
  const isSelectionFinished = useMemo(() => selectingColumnIndex >= enabledColumns.length + 1, [selectingColumnIndex, enabledColumns]);

  useEffect(() => {
    if (isOpen) {
      // Reset config but keep reference for existing configs
      const newConfig = currentConfig ? {...currentConfig} : {...initialConfig};
      setConfig(newConfig);
      setStep(1);
      setSelectingColumnIndex(0);
    }
  }, [isOpen, currentConfig]);

  useEffect(() => {
    if (step === 2) {
      setSelectingColumnIndex(0);
    }
  }, [step]);


  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...config.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    handleConfigChange('columns', newColumns);
  };
  
  const handleColumnBboxChange = (colId, bbox) => {
    const newColumns = config.columns.map(c => c.id === colId ? {...c, bbox} : c);
    handleConfigChange('columns', newColumns);
  }

  const onPageLoadSuccess = useCallback((page) => {
    setPageDimensions({ width: page.width, height: page.height });
  }, []);

  const getPdfCoords = (e) => {
    if (!pageRef.current || !pageDimensions) return null;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pdfX = x / scale;
    const pdfY = y / scale;

    return { x: pdfX, y: pdfY };
  };

  const handleMouseDown = (e) => {
    if (!pageDimensions || step !== 2 || isSelectionFinished) return;
    e.preventDefault();
    setIsSelecting(true);
    const coords = getPdfCoords(e);
    setStartPoint(coords);
    setEndPoint(coords);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !pageDimensions || step !== 2) return;
    const coords = getPdfCoords(e);
    setEndPoint(coords);
  };

  const handleMouseUp = () => {
    if (isSelecting && startPoint && endPoint) {
      const newSelection = {
        x1: Math.min(startPoint.x, endPoint.x),
        y1: Math.min(startPoint.y, endPoint.y),
        x2: Math.max(startPoint.x, endPoint.x),
        y2: Math.max(startPoint.y, endPoint.y),
      };
      if (Math.abs(newSelection.x1 - newSelection.x2) > 2 && Math.abs(newSelection.y1 - newSelection.y2) > 2) {
        // Selecting a column
        if(selectingColumnIndex < enabledColumns.length) {
          const currentCol = enabledColumns[selectingColumnIndex];
          handleColumnBboxChange(currentCol.id, newSelection);
          setSelectingColumnIndex(prev => prev + 1);
        // Selecting the final table Y-area
        } else if (selectingColumnIndex === enabledColumns.length) {
          handleConfigChange('tableYBbox', { y1: newSelection.y1, y2: newSelection.y2 });
          setSelectingColumnIndex(prev => prev + 1);
        }
      }
    }
    setIsSelecting(false);
    setStartPoint(null);
    setEndPoint(null);
  };

  const handleSave = () => {
    onSave(config);
  };

  const getSelectionStyle = (points, color, dash) => {
    if (!pageDimensions || !points) return {};
    
    const x1 = points.x1 * scale;
    const y1 = points.y1 * scale;
    const width = (points.x2 - points.x1) * scale;
    const height = (points.y2 - points.y1) * scale;

    return {
      position: 'absolute',
      left: `${x1}px`,
      top: `${y1}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: `2px ${dash ? 'dashed' : 'solid'} ${color}`,
      backgroundColor: `rgba(${color === '#007bff' ? '0, 123, 255' : '40, 167, 69'}, 0.2)`,
      zIndex: 10,
    };
  }
  
  const zoomIn = () => setScale(prev => prev + 0.2);
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));

  const tabOptions = [
    { id: 1, label: '1. Configuração' },
    { id: 2, label: '2. Seleção de Área' },
  ];

  const renderHelpText = () => {
    if (step === 1) {
      return "Configure as colunas e o formato dos valores do seu extrato."
    }
    // Step 2 help text
    if (isSelectionFinished) {
      return "Seleção concluída! Clique em Salvar para finalizar.";
    }
    if (selectingColumnIndex < enabledColumns.length) {
      const currentCol = enabledColumns[selectingColumnIndex];
      return `Selecione a área da coluna: "${currentCol.name}"`;
    }
    return "Por último, selecione a altura total da tabela de transações (a largura da seleção não importa).";
  }

  const valueFormatOptions = [
    { value: 'single_column_sign', label: 'Coluna única com sinais (+/-)' },
    { value: 'debit_credit_columns', label: 'Colunas separadas de Débito e Crédito' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Extração de Extrato" dialogClassName="max-w-5xl w-full">
      <div className="flex flex-col h-[90vh]">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStep(tab.id)}
                  className={`${ step === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 min-h-[20px]">
            {renderHelpText()}
          </p>
        </div>

        {step === 1 && (
           <div className="p-8 flex-grow overflow-y-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <fieldset className="space-y-4">
                    <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200">Colunas do Extrato</legend>
                    {config.columns.map((col, index) => (
                        <div key={col.id} className="flex items-center space-x-4 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                            <input
                                type="checkbox"
                                id={`col-enabled-${col.id}`}
                                checked={col.enabled}
                                onChange={(e) => handleColumnChange(index, 'enabled', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className='flex-grow'>
                               <Input
                                  id={`col-name-${col.id}`}
                                  value={col.name}
                                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                                  disabled={!col.enabled}
                                  label={`Nome da Coluna ${index + 1}`}
                                  className="w-full"
                               />
                            </div>
                        </div>
                    ))}
                </fieldset>
                <div className="space-y-8">
                    <fieldset>
                      <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Formato do Valor</legend>
                      <Select
                          id="valueFormat"
                          label="Como os valores são representados?"
                          value={config.valueFormat}
                          onChange={(e) => handleConfigChange('valueFormat', e.target.value)}
                          options={valueFormatOptions}
                      />
                    </fieldset>
                    <fieldset>
                      <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Opções Adicionais</legend>
                       <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="hasHeader"
                            name="hasHeader"
                            type="checkbox"
                            checked={config.hasHeader}
                            onChange={(e) => handleConfigChange('hasHeader', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="hasHeader" className="font-medium text-gray-900 dark:text-gray-100">
                            Ignorar primeira linha
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">Marque se a tabela no extrato contém um cabeçalho.</p>
                        </div>
                      </div>
                    </fieldset>
                </div>
             </div>
           </div>
        )}

        {step === 2 && (
          <div 
            className="relative flex-grow overflow-auto bg-gray-300 dark:bg-gray-700 flex justify-center p-4"
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div 
              ref={pageRef} 
              className="relative shadow-lg"
              onMouseDown={handleMouseDown}
            >
              <Document file={file} onLoadError={console.error}>
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                />
              </Document>
              {isSelecting && startPoint && endPoint && (
                <div style={getSelectionStyle({
                  x1: Math.min(startPoint.x, endPoint.x),
                  y1: Math.min(startPoint.y, endPoint.y),
                  x2: Math.max(startPoint.x, endPoint.x),
                  y2: Math.max(startPoint.y, endPoint.y),
                }, '#007bff', true)}></div>
              )}
              {config.columns.map(c => c.enabled && c.bbox && (
                <div key={c.id} style={getSelectionStyle(c.bbox, '#28a745', false)}></div>
              ))}
              {config.tableYBbox && (
                 <div style={getSelectionStyle({x1: 0, x2: pageDimensions?.width || 0, ...config.tableYBbox}, '#dc3545', false)}></div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
            {step === 2 ? (
              <div className="flex items-center space-x-2">
                <Button onClick={zoomOut} variant="secondary" size="icon">
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[40px] text-center">{(scale * 100).toFixed(0)}%</span>
                <Button onClick={zoomIn} variant="secondary" size="icon">
                  <ZoomIn className="w-5 h-5" />
                </Button>
              </div>
            ) : <div></div>}
            
            <div className="flex justify-end space-x-2">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Voltar
                </Button>
              )}
              {step < tabOptions.length ? (
                <Button variant="primary" onClick={() => setStep(step + 1)}>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSave} disabled={!isSelectionFinished}>Salvar</Button>
              )}
            </div>
        </div>
      </div>
    </Modal>
  );
}