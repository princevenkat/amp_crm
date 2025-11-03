import React, { useState, useMemo, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';
import type { Contact } from '../types';
import { SearchIcon, PlusIcon, EditIcon, MinusIcon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { NewContactForm } from '../components/forms/NewContactForm';


export const ContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);


  const lenders = contacts.filter(c => c.type === 'Lender');
  const solicitors = contacts.filter(c => c.type === 'Solicitor');
  const accountants = contacts.filter(c => c.type === 'Accountant');
  const surveyors = contacts.filter(c => c.type === 'Surveyor');
  const estateAgents = contacts.filter(c => c.type === 'EstateAgent');



  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, contacts]);

  const handleOpenCreateModal = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setContactToEdit(null);
    setIsModalOpen(false);
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id'>) => {
    if (contactToEdit) {
      await updateContact(contactToEdit.id, contactData);
    } else {
      await addContact(contactData);
    }
    handleCloseModal();
  };

  return (
    <div className="p-4 sm:p-8">
      <Modal title={contactToEdit ? "Edit Contact" : "Create New Contact"} isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewContactForm
          onSubmit={handleSaveContact}
          onCancel={handleCloseModal}
          initialData={contactToEdit}
        />
      </Modal>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Contacts Directory</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">{SearchIcon}</span>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {PlusIcon}
            <span>New Contact</span>
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-text-secondary">Name</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Type</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Company</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Email</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Phone</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-text-primary">{contact.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full">{contact.type}</span>
                </td>
                <td className="px-6 py-4">{contact.company}</td>
                <td className="px-6 py-4">{contact.email}</td>
                <td className="px-6 py-4">{contact.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenEditModal(contact)} className="text-text-secondary hover:text-secondary">{EditIcon}</button>
                    <button onClick={() => deleteContact(contact.id)} className="text-text-secondary hover:text-danger">{MinusIcon}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
