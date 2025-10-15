import React, { useState, useContext } from 'react';
import type { Proposal } from '../../types';
import { DataContext } from '../../contexts/DataContext';

interface NewProposalFormProps {
  onSubmit: (proposal: Omit<Proposal, 'id'>) => void;
  onCancel: () => void;
}

export const NewProposalForm: React.FC<NewProposalFormProps> = ({ onSubmit, onCancel }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState<Omit<Proposal, 'id'>>({
    clientName: clients[0]?.name || '',
    product: '',
    value: 0,
    status: 'Draft',
    sentDate: '-',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
       <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block font-medium text-text-secondary mb-1">Client</label>
            <select name="clientName" onChange={handleChange} value={formData.clientName} className="w-full bg-surface border border-gray-300 rounded-md p-2">
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Product</label>
          <input type="text" name="product" onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Value ($)</label>
          <input type="number" name="value" onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
         <div>
          <label className="block font-medium text-text-secondary mb-1">Status</label>
          <select name="status" onChange={handleChange} value={formData.status} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            <option>Draft</option>
            <option>Sent</option>
            <option>Accepted</option>
            <option>Declined</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Proposal</button>
      </div>
    </form>
  );
};
