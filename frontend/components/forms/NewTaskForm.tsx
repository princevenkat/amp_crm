import React, { useState, useContext, useEffect } from 'react';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';
import { DataContext } from '../../contexts/DataContext';

interface NewTaskFormProps {
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  clientId?: string;
  initialData?: Task | null;
}

const advisors = ['You', 'John Doe', 'Jane Smith', 'Peter Jones', 'Admin'];

const getEmptyFormState = (clientId: string = ''): Omit<Task, 'id'> => ({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    // FIX: Replaced `TaskStatus.Active` with `TaskStatus.Enquiry` as 'Active' is not a valid status in the `TaskStatus` enum.
    status: TaskStatus.Enquiry,
    assignedTo: advisors[0],
    assignedBy: 'You',
    clientId: clientId,
});


export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel, clientId = '', initialData }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState<Omit<Task, 'id'>>(
    initialData || getEmptyFormState(clientId)
  );

  useEffect(() => {
    // This effect handles both setting initial data for editing and resetting the form for creation
    setFormData(initialData || getEmptyFormState(clientId));
  }, [initialData, clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label className="block font-medium text-text-secondary mb-1">Task Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
      </div>

      <div>
        <label className="block font-medium text-text-secondary mb-1">Description</label>
        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block font-medium text-text-secondary mb-1">Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Status</label>
          <select name="status" onChange={handleChange} value={formData.status} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-text-secondary mb-1">Assigned To</label>
          <select name="assignedTo" onChange={handleChange} value={formData.assignedTo} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            {advisors.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Assigned By</label>
          <select name="assignedBy" onChange={handleChange} value={formData.assignedBy} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
            {advisors.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>
       <div>
        <label className="block font-medium text-text-secondary mb-1">Link to Client (Optional)</label>
        <select 
            name="clientId" 
            onChange={handleChange} 
            value={formData.clientId} 
            className="w-full bg-surface border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
            disabled={!!clientId && !initialData} // Disable if clientId is passed for a new task, but allow editing for existing tasks.
        >
            <option value="">None</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.caseReference})</option>)}
        </select>
    </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Task</button>
      </div>
    </form>
  );
};