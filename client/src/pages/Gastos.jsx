import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

// Importando ícones da biblioteca lucide-react
import {
  Filter,
  CalendarDays,
} from 'lucide-react';

// Importando componentes de gráficos da biblioteca recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


// Dados simulados para o gráfico de gastos
const mockSpendingData = [
  { name: 'Supermercado', value: 850.50 },
  { name: 'Transporte', value: 420.00 },
  { name: 'Lazer', value: 310.00 },
  { name: 'Alimentação', value: 550.70 },
  { name: 'Casa', value: 210.80 },
  { name: 'Outros', value: 150.00 },
];


export default function GastosPage() {
    return (
    <div>
      <Header title="Análise de Gastos" />
      
      {/* Seção de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtrar por Tipo</h3>
          <Button variant="secondary" icon={Filter}>
            Todos os Tipos
          </Button>
        </Card>
        <Card className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtrar por Data</h3>
          <Button variant="secondary" icon={CalendarDays}>
            Desde o início
          </Button>
        </Card>
        <Card className="bg-blue-600 text-white">
          <h3 className="text-sm font-medium text-blue-200">Total Gasto (Período)</h3>
          <p className="text-3xl font-bold">
            {mockSpendingData
              .reduce((acc, item) => acc + item.value, 0)
              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </Card>
      </div>

      {/* Seção do Gráfico */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Gastos por Categoria</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={mockSpendingData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$${value}`} />
              <Tooltip
                formatter={(value) =>
                  value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                }
              />
              <Legend wrapperStyle={{ color: 'var(--legend-text, #374151)' }} className="dark:[--legend-text:#d1d5db]" />
              <Bar dataKey="value" name="Gasto" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}