import { useState } from 'react';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';

import {
  Upload,
  Trash2,
} from 'lucide-react';


// Dados simulados para transações (viriam do OCR)
const mockTransactions = [
  { id: 1, institution: 'Supermercado Pague Menos', amount: 345.60, category: null },
  { id: 2, institution: 'Posto Shell Av. Central', amount: 150.00, category: null },
  { id: 3, institution: 'Netflix.com', amount: 55.90, category: 'lazer' },
  { id: 4, institution: 'Restaurante Sabor Divino', amount: 120.00, category: 'alimentacao' },
  { id: 5, institution: 'CPFL Energia', amount: 210.80, category: 'casa' },
];

// Opções de categoria
const categoryOptions = [
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'alimentacao', label: 'Alimentação (Restaurante/Delivery)' },
  { value: 'lazer', label: 'Lazer e Assinaturas' },
  { value: 'casa', label: 'Contas da Casa' },
  { value: 'outros', label: 'Outros' },
];


export default function DashboardPage() {

  const [transactions, setTransactions] = useState(mockTransactions);

  // Função para atualizar a categoria de uma transação
  const handleCategoryChange = (id, newCategory) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, category: newCategory } : t))
    );
  };

  return (
    <div>
      <Header title="Dashboard" />
      
      {/* Seção de Upload */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Upload de Extrato (PDF)</h2>
        <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">Arraste e solte seu extrato PDF aqui ou</p>
          <Button variant="primary">
            Selecionar Arquivo
          </Button>
          <input type="file" className="hidden" accept=".pdf" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">A ferramenta de OCR irá extrair as transações.</p>
        </div>
      </Card>

      {/* Seção de Classificação */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Classificar Transações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Transações extraídas do PDF. Por favor, classifique as que não foram reconhecidas.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instituição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor (R$)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.institution}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-semibold">
                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ minWidth: '200px' }}>
                    <Select
                      options={categoryOptions}
                      value={t.category}
                      onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                      placeholder="Selecione uma categoria..."
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

}