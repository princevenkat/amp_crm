import React, { useState, useContext } from 'react';
import type { Deal } from '../../types';
import { DataContext } from '../../contexts/DataContext';

interface NewDealFormProps {
  onSubmit: (deal: Omit<Deal, 'id'>) => void;
  onCancel: () => void;
}

export const NewDealForm: React.FC<NewDealFormProps> = ({ onSubmit, onCancel }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState<Omit<Deal, 'id'>>({
    title: '',
    clientId: clients[0]?.id || '',
    value: 0,
    stage: 'New',
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
      <div>
        <label className="block font-medium text-text-secondary mb-1">Deal Title</label>
        <input type="text" name="title" onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block font-medium text-text-secondary mb-1">Client</label>
            <select name="clientId" onChange={handleChange} value={formData.clientId} className="w-full bg-surface border border-gray-300 rounded-md p-2">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Value ($)</label>
          <input type="number" name="value" onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Deal</button>
      </div>
    </form>
  );
};