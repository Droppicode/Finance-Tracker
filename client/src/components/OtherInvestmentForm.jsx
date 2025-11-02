import { useState } from 'react';
import { useInvestments } from '../context/InvestmentContext';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { Plus } from 'lucide-react';

const otherInvestmentTypes = [
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'ouro', label: 'Ouro' },
  { value: 'outro', label: 'Outro' },
];

const RendaFixaForm = ({ formData, setFormData, setError }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    if (name.startsWith('details.')) {
      const detailField = name.split('.')[1];
      setFormData(prev => ({ ...prev, details: { ...prev.details, [detailField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-4">
      <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nome do Ativo" required />
      <Input name="details.issuer" value={formData.details.issuer || ''} onChange={handleChange} placeholder="Emissor / Corretora" required />
      <div className="flex gap-4">
        <Input type="date" name="details.start_date" value={formData.details.start_date || ''} onChange={handleChange} placeholder="Data de Início" required />
        <Input type="date" name="details.due_date" value={formData.details.due_date || ''} onChange={handleChange} placeholder="Data de Vencimento" required />
      </div>
      <Input type="number" name="details.invested_amount" value={formData.details.invested_amount || ''} onChange={handleChange} placeholder="Valor Investido" required />
      <Select name="details.yield_type" value={formData.details.yield_type || ''} onChange={handleChange} options={[
        { value: 'prefixado', label: 'Prefixado' },
        { value: 'posfixado', label: 'Pós-fixado' },
        { value: 'hibrido', label: 'Híbrido (Inflação)' },
      ]} placeholder="Tipo de Rentabilidade" required />

      {formData.details.yield_type === 'prefixado' && (
        <Input type="number" name="details.rate" value={formData.details.rate || ''} onChange={handleChange} placeholder="Taxa Anual (%)" required />
      )}

      {formData.details.yield_type === 'posfixado' && (
        <div className="flex gap-4">
          <Select name="details.indexer" value={formData.details.indexer || ''} onChange={handleChange} options={[
            { value: 'CDI', label: 'CDI' },
            { value: 'SELIC', label: 'SELIC' },
          ]} placeholder="Indexador" required />
          <Input type="number" name="details.indexer_percentage" value={formData.details.indexer_percentage || ''} onChange={handleChange} placeholder="Percentual do Indexador (%)" required />
        </div>
      )}

      {formData.details.yield_type === 'hibrido' && (
        <div className="flex gap-4">
          <Select name="details.indexer" value={formData.details.indexer || ''} onChange={handleChange} options={[
            { value: 'IPCA', label: 'IPCA' },
            { value: 'IGPM', label: 'IGPM' },
          ]} placeholder="Indexador" required />
          <Input type="number" name="details.spread_rate" value={formData.details.spread_rate || ''} onChange={handleChange} placeholder="Taxa Spread (%)" required />
        </div>
      )}
    </div>
  );
};

const OtherInvestmentForm = () => {
  const { addOtherInvestment, loading } = useInvestments();
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({ name: '', details: {} });
  const [error, setError] = useState(null);

  const validateForm = () => {
    const missingFields = [];
    if (!type) missingFields.push("Tipo de Investimento");
    if (!formData.name) missingFields.push("Nome do Ativo");

    if (type === 'renda_fixa') {
      if (!formData.details.issuer) missingFields.push("Emissor");
      if (!formData.details.start_date) missingFields.push("Data de Início");
      if (!formData.details.due_date) missingFields.push("Data de Vencimento");
      if (!formData.details.invested_amount) missingFields.push("Valor Investido");
      if (!formData.details.yield_type) missingFields.push("Tipo de Rentabilidade");

      if (formData.details.yield_type === 'prefixado' && !formData.details.rate) {
        missingFields.push("Taxa Anual");
      }
      if (formData.details.yield_type === 'posfixado') {
        if (!formData.details.indexer) missingFields.push("Indexador");
        if (!formData.details.indexer_percentage) missingFields.push("Percentual do Indexador");
      }
      if (formData.details.yield_type === 'hibrido') {
        if (!formData.details.indexer) missingFields.push("Indexador");
        if (!formData.details.spread_rate) missingFields.push("Taxa Spread");
      }
    }

    if (missingFields.length > 0) {
      setError(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    await addOtherInvestment({ ...formData, type, purchase_date: new Date().toISOString().slice(0, 10) });
    setFormData({ name: '', details: {} });
    setType('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        options={otherInvestmentTypes}
        value={type}
        onChange={(e) => { setType(e.target.value); setError(null); }}
        placeholder="Selecione o tipo de investimento"
      />
      {type === 'renda_fixa' && <RendaFixaForm formData={formData} setFormData={setFormData} setError={setError} />}
      {/* Render other forms based on type here */}
      {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
      <Button type="submit" variant="primary" icon={Plus} className="w-full" disabled={loading}>
        Adicionar
      </Button>
    </form>
  );
};

export default OtherInvestmentForm;
