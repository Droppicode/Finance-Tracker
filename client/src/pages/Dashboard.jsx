import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTransactions } from '../context/TransactionContext';
import { useUtils } from '../context/UtilsContext';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryManager from '../components/CategoryManager';
import CategoryFilter from '../components/CategoryFilter';
import DateRangePicker from '../components/DateRangePicker';

import {
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Configure o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function DashboardPage() {
  const {
    transactions,
    categories,
    processStatement,
    deleteTransaction,
    updateTransactionCategory,
    addCategory,
    removeCategory,
    loading,
    selectedCategoryIds,
    toggleCategoryFilter,
  } = useTransactions();

  const { startDate, endDate, updateDates } = useUtils();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

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

  const handleCategoryChange = async (id, newCategoryId) => {
    await updateTransactionCategory(id, newCategoryId);
    setEditingCategoryId(null);
  };

  const toggleCategoryEditor = (id) => {
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
    } else {
      setEditingCategoryId(id);
    }
  };

  return (
    <div>
      <Header title="Dashboard" />
      
      <Card className="mb-6">
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
                    <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant="secondary">
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Anterior
                    </Button>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Página {pageNumber} de {numPages}
                    </p>
                    <Button onClick={goToNextPage} disabled={pageNumber >= numPages} variant="secondary">
                      Próxima
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {loading ? (
        <p>Carregando transações...</p>
      ) : (
        <Card>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Transações</h2>
            <div className="flex flex-wrap items-center gap-4">
                <CategoryFilter 
                  allCategories={categories}
                  selectedIds={selectedCategoryIds}
                  onToggleCategory={toggleCategoryFilter}
                />
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={(newStartDate) => updateDates(newStartDate, endDate)}
                  onEndDateChange={(newEndDate) => updateDates(startDate, newEndDate)}
                />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instituição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor (R$)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'credit' ? '+' : '-'} {(Number(t.amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm relative" style={{ minWidth: '200px' }}>
                      <div onClick={() => toggleCategoryEditor(t.id)} className="cursor-pointer p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {t.category?.name || 'Selecione uma categoria...'}
                      </div>
                      {editingCategoryId === t.id && (
                        <CategoryManager 
                          categories={categories.map(c => ({ value: c.id, label: c.name }))}
                          onSelectCategory={(category) => handleCategoryChange(t.id, category)}
                          onAddCategory={addCategory}
                          onRemoveCategory={removeCategory}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

}