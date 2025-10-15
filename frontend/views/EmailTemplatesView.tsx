import React, { useContext, useState } from 'react';
import { PlusIcon } from '../components/ui/Icons';
import { DataContext } from '../contexts/DataContext';
import { Modal } from '../components/ui/Modal';
import type { EmailTemplate } from '../types';

const NewTemplateForm: React.FC<{ onSubmit: (data: Omit<EmailTemplate, 'id'>) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && subject) {
            onSubmit({ name, subject, lastUpdated: new Date().toISOString().split('T')[0] });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Template Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Subject Line</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save</button>
            </div>
        </form>
    );
}

export const EmailTemplatesView: React.FC = () => {
    const { emailTemplates, addEmailTemplate } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddTemplate = async (data: Omit<EmailTemplate, 'id'>) => {
        await addEmailTemplate(data);
        setIsModalOpen(false);
    }
    
  return (
    <div className="p-4 sm:p-8">
        <Modal title="Create New Email Template" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <NewTemplateForm onSubmit={handleAddTemplate} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto">
            {PlusIcon}
            <span>New Template</span>
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-text-secondary">Template Name</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Subject Line</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Last Updated</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emailTemplates.map(template => (
              <tr key={template.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-text-primary">{template.name}</td>
                <td className="px-6 py-4">{template.subject}</td>
                <td className="px-6 py-4">{template.lastUpdated}</td>
                <td className="px-6 py-4">
                    <button className="text-secondary hover:underline font-semibold">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
