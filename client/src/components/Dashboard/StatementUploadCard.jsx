import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import Button from '../shared/Button';
import { Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configure o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function StatementUploadCard({ processStatement }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDrop = useCallback(acceptedFiles => {
    setUploadedFile(acceptedFiles[0]);
    setIsPreviewOpen(false);
    setPageNumber(1);
    setScale(1.0);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (uploadedFile) {
      setIsProcessing(true);
      setError(null);
      try {
        await processStatement(uploadedFile);
      } catch (error) {
        console.error('Error processing statement:', error);
        setError('Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  const zoomIn = () => setScale(prev => prev + 0.1);
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div className="md:pr-8">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Upload de Extrato (PDF)</h2>
      <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
        {isDragActive ?
          <p className="text-gray-600 dark:text-gray-200">Solte o arquivo aqui...</p> :
          <p className="text-gray-600 dark:text-gray-200">Arraste e solte o PDF aqui ou clique para selecionar</p>
        }
      </div>
      {uploadedFile && (
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Arquivo: {uploadedFile.name}</p>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsPreviewOpen(!isPreviewOpen)} variant="secondary">
                {isPreviewOpen ? 'Fechar Preview' : 'Abrir Preview'}
              </Button>
              <Button onClick={handleUpload} variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Processando...' : 'Processar Arquivo'}
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4 text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
          {isPreviewOpen && (
            <div className="border rounded-lg p-4 bg-gray-200 dark:bg-gray-900">
              <div className="max-h-96 overflow-y-auto mb-4">
                <Document
                  file={uploadedFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={pageNumber} scale={scale} className="pdf-page" renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button onClick={zoomOut} variant="secondary">
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{(scale * 100).toFixed(0)}%</span>
                  <Button onClick={zoomIn} variant="secondary">
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant="ghost" size="icon">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Página {pageNumber} de {numPages}
                  </p>
                  <Button onClick={goToNextPage} disabled={pageNumber >= numPages} variant="ghost" size="icon">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
