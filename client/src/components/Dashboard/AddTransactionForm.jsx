import { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { PlusCircle } from 'lucide-react';

const AddTransactionForm = () => {
  const { addTransaction, categories } = useTransactions();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('debit');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date || !categoryId) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await addTransaction({
        description,
        amount: parseFloat(amount),
        date,
        category_id: categoryId,
        type,
      });
      // Reset form
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategoryId('');
      setType('debit');
    } catch (err) {
      setError('Falha ao adicionar transação. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));
  const typeOptions = [
    { value: 'debit', label: 'Despesa' },
    { value: 'credit', label: 'Receita' },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Adicionar Nova Transação</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descrição"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Salário, Aluguel"
          required
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Valor (R$)"
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Input
            label="Data"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
                label="Tipo"
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={typeOptions}
            />
            <Select
                label="Categoria"
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={[{ value: '', label: 'Selecione...' }, ...categoryOptions]}
                required
            />
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <PlusCircle className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Adicionando...' : 'Adicionar Transação'}
        </Button>
      </form>
    </div>
  );
};

export default AddTransactionForm;
