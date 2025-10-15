import React, { useState, useContext, useEffect } from 'react';
import type { LedgerEntry } from '../../types';
import { DataContext } from '../../contexts/DataContext';

interface NewLedgerEntryFormProps {
  onSubmit: (entry: Omit<LedgerEntry, 'id'>) => void;
  onCancel: () => void;
  initialData?: LedgerEntry | null;
}

const emptyFormState: Omit<LedgerEntry, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  clientName: '-',
  description: '',
  amount: 0,
  type: 'Commission',
};

export const NewLedgerEntryForm: React.FC<NewLedgerEntryFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState<Omit<LedgerEntry, 'id'>>(initialData || emptyFormState);

  useEffect(() => {
    setFormData(initialData || emptyFormState);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-text-secondary mb-1">Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Type</label>
          <select name="type" onChange={handleChange} value={formData.type} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            <option value="Commission">Commission</option>
            <option value="Fee">Fee</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block font-medium text-text-secondary mb-1">Client (Optional)</label>
        <select name="clientName" onChange={handleChange} value={formData.clientName} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            <option value="-">-</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
       <div>
          <label className="block font-medium text-text-secondary mb-1">Description</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
      <div>
        <label className="block font-medium text-text-secondary mb-1">Amount ($)</label>
        <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required placeholder="Use negative for expenses" />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Entry</button>
      </div>
    </form>
  );
};