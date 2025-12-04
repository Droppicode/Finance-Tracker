import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function AreaSelectionModal({ isOpen, onClose, file, onSave, currentSelection }) {
  const [pageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [selection, setSelection] = useState(currentSelection);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const pageRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState(null);

  useEffect(() => {
    // Reset selection when modal is opened with a new currentSelection
    if (isOpen) {
      setSelection(currentSelection);
    }
  }, [isOpen, currentSelection]);

  const onPageLoadSuccess = useCallback((page) => {
    setPageDimensions({ width: page.width, height: page.height });
  }, []);

  const getPdfCoords = (e) => {
    if (!pageRef.current || !pageDimensions) return null;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert screen coordinates to PDF coordinates
    const pdfX = x / scale;
    const pdfY = y / scale;

    return { x: pdfX, y: pdfY };
  };

  const handleMouseDown = (e) => {
    if (!pageDimensions) return;
    e.preventDefault(); // Prevent text selection
    setIsSelecting(true);
    const coords = getPdfCoords(e);
    setStartPoint(coords);
    setEndPoint(coords);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !pageDimensions) return;
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
      // Only update if the selection is more than a click
      if (Math.abs(newSelection.x1 - newSelection.x2) > 5 && Math.abs(newSelection.y1 - newSelection.y2) > 5) {
        setSelection(newSelection);
      }
    }
    setIsSelecting(false);
    setStartPoint(null);
    setEndPoint(null);
  };

  const handleSave = () => {
    onSave(selection);
  };

  const getSelectionStyle = (points, color, dash) => {
    if (!pageDimensions) return {};
    
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecione a Área de Transações" dialogClassName="max-w-5xl w-full">
      <div className="flex flex-col h-[90vh]">
        <div className="p-4 bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Clique e arraste no PDF para selecionar a área da tabela de transações. Use o zoom para ajustar a visualização.
          </p>
        </div>
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
            {selection && !isSelecting && (
              <div style={getSelectionStyle(selection, '#28a745', false)}></div>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button onClick={zoomOut} variant="secondary" size="icon">
                <ZoomOut className="w-5 h-5" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[40px] text-center">{(scale * 100).toFixed(0)}%</span>
              <Button onClick={zoomIn} variant="secondary" size="icon">
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="primary" onClick={handleSave} disabled={!selection}>Salvar</Button>
            </div>
        </div>
      </div>
    </Modal>
  );
}