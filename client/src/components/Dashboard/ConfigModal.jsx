import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Select from '../shared/Select';
import Input from '../shared/Input';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const initialColumn = (id, name, enabled = true) => ({ id, name, enabled, bbox: null, bbox_debit: null, bbox_credit: null });
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

const SelectionControl = ({ selectionSteps, setSelectionStepIndex, config }) => {
  const getStepStatus = (step) => {
    if (step.selectionType === 'y_bbox') {
      return config.tableYBbox ? 'completed' : 'pending';
    }

    const column = config.columns.find(c => c.id === step.id);
    if (!column || !column.enabled) return 'disabled';
    
    if (step.selectionType === 'credit') {
      return column.bbox_credit ? 'completed' : 'pending';
    }
    if (step.selectionType === 'debit') {
      return column.bbox_debit ? 'completed' : 'pending';
    }
    return column.bbox ? 'completed' : 'pending';
  };

  const handleStepSelect = (stepIndex) => {
      setSelectionStepIndex(stepIndex);
  };

  return (
      <div className="absolute top-4 left-4 z-20 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Marcar Colunas:</h3>
          <div className="space-y-2">
              {selectionSteps.map((step, index) => {
                  const status = getStepStatus(step);
                  return (
                      <button
                        key={step.id + (step.selectionType || '')}
                        onClick={() => handleStepSelect(index)}
                        disabled={status === 'disabled'}
                        className={`w-full text-left text-gray-800 dark:text-gray-200 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between ${
                          status === 'completed' ? 'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200' :
                          status === 'pending' ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' :
                          'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <span>{step.displayName}</span>
                        {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </button>
                  );
              })}
          </div>
      </div>
  );
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

  const [selectionStepIndex, setSelectionStepIndex] = useState(0);

  const selectionSteps = useMemo(() => {
    const steps = [];
    config.columns.forEach(col => {
      if (col.enabled) {
        if (col.id === 'value' && config.valueFormat === 'debit_credit_columns') {
          steps.push({ ...col, selectionType: 'debit', displayName: `${col.name} (Débito)` });
          steps.push({ ...col, selectionType: 'credit', displayName: `${col.name} (Crédito)` });
        } else {
          steps.push({ ...col, selectionType: 'column', displayName: col.name });
        }
      }
    });
    steps.push({ id: 'y_bbox', selectionType: 'y_bbox', displayName: 'Altura da Tabela' });
    return steps;
  }, [config.columns, config.valueFormat]);

  const isSelectionFinished = useMemo(() => selectionStepIndex >= selectionSteps.length, [selectionStepIndex, selectionSteps]);

  const tableXBounds = useMemo(() => {
    const allBboxes = config.columns.flatMap(c => {
        if (!c.enabled) return [];
        const bboxes = [];
        if(c.bbox) bboxes.push(c.bbox);
        if(c.bbox_debit) bboxes.push(c.bbox_debit);
        if(c.bbox_credit) bboxes.push(c.bbox_credit);
        return bboxes;
    });

    if (allBboxes.length === 0) return null;

    const minX1 = Math.min(...allBboxes.map(b => b.x1));
    const maxX2 = Math.max(...allBboxes.map(b => b.x2));

    return { x1: minX1, x2: maxX2 };
  }, [config.columns]);

  useEffect(() => {
    if (isOpen) {
      const newConfig = currentConfig ? {...currentConfig} : {...initialConfig};
      setConfig(newConfig);
      setStep(1);
      setSelectionStepIndex(0);
    }
  }, [isOpen, currentConfig]);

  useEffect(() => {
    if (step === 2 && !isSelectionFinished) {
      setSelectionStepIndex(0);
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
  
  const handleColumnBboxChange = (colId, bbox, type) => {
    const newColumns = config.columns.map(c => {
      if (c.id === colId) {
        if (type === 'debit') return { ...c, bbox_debit: bbox };
        if (type === 'credit') return { ...c, bbox_credit: bbox };
        return { ...c, bbox };
      }
      return c;
    });
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
        const currentStep = selectionSteps[selectionStepIndex];
        
        switch(currentStep.selectionType) {
          case 'column':
            handleColumnBboxChange(currentStep.id, newSelection);
            break;
          case 'debit':
            handleColumnBboxChange(currentStep.id, newSelection, 'debit');
            break;
          case 'credit':
            handleColumnBboxChange(currentStep.id, newSelection, 'credit');
            break;
          case 'y_bbox':
            handleConfigChange('tableYBbox', newSelection);
            break;
          default:
            break;
        }
        // Move to next step only if not editing
        if (selectionStepIndex < selectionSteps.length -1) {
            setSelectionStepIndex(prev => prev + 1);
        } else {
            setSelectionStepIndex(selectionSteps.length); // Mark as finished
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

  const getSelectionStyle = (points, color, dash, isActive = false) => {
    if (!pageDimensions || !points) return {};
    
    const x1 = points.x1 * scale;
    const y1 = points.y1 * scale;
    const width = (points.x2 - points.x1) * scale;
    const height = (points.y2 - points.y1) * scale;
  
    const style = {
      position: 'absolute',
      left: `${x1}px`,
      top: `${y1}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: `${isActive ? 3 : 2}px ${dash ? 'dashed' : 'solid'} ${color}`,
      zIndex: 10,
      cursor: 'pointer',
    };
  
    if (color === '#dc3545' || color === '#007bff') {
      const rgb = color === '#dc3545' ? '220,53,69' : '0,123,255';
      style.backgroundColor = `rgba(${rgb}, 0.2)`;
    }
  
    return style;
  }

  const SelectionMarker = ({ points, color, isVertical = false, isActive = false, onMouseDown }) => {
    if (!pageDimensions || !points) return null;

    const x1 = points.x1 * scale;
    const y1 = points.y1 * scale;
    const width = (points.x2 - points.x1) * scale;
    const height = (points.y2 - points.y1) * scale;
    
    const capSize = 10;
    const lineThickness = isActive ? 3 : 2;

    const baseStyle = {
        position: 'absolute',
        backgroundColor: color,
        zIndex: 10,
        pointerEvents: 'none',
    };

    const wrapperStyle = {
        position: 'absolute',
        left: `${x1}px`,
        top: `${y1}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'pointer',
        zIndex: 11,
        backgroundColor: 'transparent',
    };

    if (isVertical) {
        return (
            <div style={wrapperStyle} onMouseDown={onMouseDown}>
                {/* Top Cap */}
                <div style={{ ...baseStyle, left: '50%', transform: 'translateX(-50%)', top: '0', width: `${capSize}px`, height: `${lineThickness}px` }}></div>
                {/* Middle Line */}
                <div style={{ ...baseStyle, left: '50%', transform: 'translateX(-50%)', top: '0', width: `${lineThickness}px`, height: `${height}px` }}></div>
                {/* Bottom Cap */}
                <div style={{ ...baseStyle, left: '50%', transform: 'translateX(-50%)', bottom: '0', width: `${capSize}px`, height: `${lineThickness}px` }}></div>
            </div>
        );
    } else {
        return (
            <div style={wrapperStyle} onMouseDown={onMouseDown}>
                {/* Left Cap */}
                <div style={{ ...baseStyle, left: '0', top: '50%', transform: 'translateY(-50%)', width: `${lineThickness}px`, height: `${capSize}px` }}></div>
                {/* Middle Line */}
                <div style={{ ...baseStyle, left: '0', top: '50%', transform: 'translateY(-50%)', width: `${width}px`, height: `${lineThickness}px` }}></div>
                {/* Right Cap */}
                <div style={{ ...baseStyle, right: '0', top: '50%', transform: 'translateY(-50%)', width: `${lineThickness}px`, height: `${capSize}px` }}></div>
            </div>
        );
    }
}
  
  const zoomIn = () => setScale(prev => prev + 0.2);
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));

  const tabOptions = [
    { id: 1, label: '1. Configuração' },
    { id: 2, label: '2. Seleção de Área' },
  ];

  const isStep1Valid = useMemo(() => {
    const required = ['date', 'description', 'value'];
    return required.every(id => config.columns.find(c => c.id === id)?.enabled);
  }, [config.columns]);

  const isStep2Valid = useMemo(() => {
    // Also validate tableYBbox is not null
    if (!config.tableYBbox) return false;
    return config.columns.every(column => {
      if (!column.enabled) return true;

      if (column.id === 'value' && config.valueFormat === 'debit_credit_columns') {
        return column.bbox_debit && column.bbox_credit;
      }
      
      return column.bbox;
    });
  }, [config]);

  const renderHelpText = () => {
    if (step === 1) {
      if (!isStep1Valid) {
        return "As colunas de Data, Descrição e Valor devem estar habilitadas.";
      }
      return "Configure as colunas e o formato dos valores do seu extrato.";
    }
    if (isSelectionFinished) {
      if (!isStep2Valid) {
        return "Ainda faltam colunas obrigatórias a serem marcadas. Use os botões para marcar as colunas que faltam.";
      }
      return "Seleção concluída! Clique em uma área para redefinir ou em Salvar.";
    }
    const currentStepInfo = selectionSteps[selectionStepIndex];
    if (currentStepInfo.selectionType === 'y_bbox') {
      return "Por último, selecione a altura da tabela de transações.";
    }
    return `Selecione a largura da coluna: "${currentStepInfo.displayName}"`;
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
                  onClick={() => tab.id === 1 || isStep1Valid ? setStep(tab.id) : null}
                  className={`${ step === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${tab.id === 2 && !isStep1Valid ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                  className="w-full text-gray-800 dark:text-gray-200"
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
            <SelectionControl
                selectionSteps={selectionSteps}
                setSelectionStepIndex={setSelectionStepIndex}
                config={config}
            />
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
              {config.columns.map(c => {
                if (!c.enabled) return null;
                
                const getStepIndex = (type) => selectionSteps.findIndex(s => s.id === c.id && s.selectionType === type);

                const boxes = [];
                if (c.bbox) {
                    const stepIndex = getStepIndex('column');
                    boxes.push(<SelectionMarker key={`${c.id}-bbox`} points={c.bbox} color="gray" isActive={selectionStepIndex === stepIndex} onMouseDown={(e) => { e.stopPropagation(); setSelectionStepIndex(stepIndex); }} />);
                }
                if (c.bbox_debit) {
                    const stepIndex = getStepIndex('debit');
                    boxes.push(<SelectionMarker key={`${c.id}-debit`} points={c.bbox_debit} color="gray" isActive={selectionStepIndex === stepIndex} onMouseDown={(e) => { e.stopPropagation(); setSelectionStepIndex(stepIndex); }} />);
                }
                if (c.bbox_credit) {
                    const stepIndex = getStepIndex('credit');
                    boxes.push(<SelectionMarker key={`${c.id}-credit`} points={c.bbox_credit} color="gray" isActive={selectionStepIndex === stepIndex} onMouseDown={(e) => { e.stopPropagation(); setSelectionStepIndex(stepIndex); }} />);
                }
                return boxes;
              })}
              {config.tableYBbox && pageDimensions && (
                 <SelectionMarker 
                    points={config.tableYBbox} 
                    color="gray" 
                    isVertical={true} 
                    isActive={selectionStepIndex === selectionSteps.findIndex(s => s.id === 'y_bbox')}
                    onMouseDown={(e) => { e.stopPropagation(); setSelectionStepIndex(selectionSteps.findIndex(s => s.id === 'y_bbox')); }}
                 />
              )}
              {isSelectionFinished && config.tableYBbox && tableXBounds && (
                 <div 
                    style={getSelectionStyle({ ...tableXBounds, y1: config.tableYBbox.y1, y2: config.tableYBbox.y2 }, '#dc3545', false, true)}
                ></div>
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
          ) : <div></div> }
            
            <div className="flex justify-end space-x-2">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Voltar
                </Button>
              )}
              {step < tabOptions.length ? (
                <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!isStep1Valid}>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSave} disabled={!isStep2Valid}>Salvar</Button>
              )}
            </div>
        </div>
      </div>
    </Modal>
  );
}