import React, { useState, useContext, useEffect } from 'react';
import type { LedgerEntry } from '../../types';
import { DataContext } from '../../contexts/DataContext';

interface NewLedgerEntryFormProps {
  onSubmit: (entry: Omit<LedgerEntry, 'id'>) => void;
  onCancel: () => void;
  initialData?: LedgerEntry | null;
}

// ✅ Include pay_status and ownerId in default state
const emptyFormState: Omit<LedgerEntry, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  clientName: '-',
  description: '',
  amount: 0,
  type: 'Commission',
  pay_status: 'Due',
};

export const NewLedgerEntryForm: React.FC<NewLedgerEntryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const { clients, currentUser } = useContext(DataContext);

  const [formData, setFormData] = useState<Omit<LedgerEntry, 'id'>>(
    initialData || { ...emptyFormState, ownerId: currentUser?.id || '' }
  );

  // useEffect(() => {
  //   setFormData(initialData || { ...emptyFormState, ownerId: currentUser?.id || '' });
  // }, [initialData, currentUser]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // 👇 Ensure proper format for <input type="date">
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({ ...emptyFormState, ownerId: currentUser?.id || '' });
    }
  }, [initialData, currentUser]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block font-medium text-text-secondary mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-surface border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium text-text-secondary mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-surface border border-gray-300 rounded-md p-2"
          >
            <option value="Broker Fee">Broker Fee</option>
            <option value="Procuration Fee">Procuration Fee</option>
            <option value="Referral Fee">Referral Fee</option>
            <option value="Expense">Expense</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>



      {/* Client */}
      <div>
        <label className="block font-medium text-text-secondary mb-1">
          Client (Optional)
        </label>
        <select
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          className="w-full bg-surface border border-gray-300 rounded-md p-2"
        >
          <option value="-">-</option>
          {clients.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium text-text-secondary mb-1">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-surface border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block font-medium text-text-secondary mb-1">
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full bg-surface border border-gray-300 rounded-md p-2"
          required
          placeholder="Use negative for expenses"
        />
      </div>

      {/* 🟩 New Pay Status Dropdown */}
      <div>
        <label className="block font-medium text-text-secondary mb-1">
          Pay Status
        </label>
        <select
          name="pay_status"
          value={formData.pay_status}
          onChange={handleChange}
          className="w-full bg-surface border border-gray-300 rounded-md p-2"
        >
          <option value="Due">Due</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md"
        >
          {initialData ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};
