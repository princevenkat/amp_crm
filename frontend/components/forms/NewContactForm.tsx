import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Contact } from '../../types';
import { ContactType } from '../../types';
import JoditEditor from "jodit-react";


interface NewContactFormProps {
  onSubmit: (contact: Omit<Contact, 'id'>) => void;
  onCancel: () => void;
  initialData?: Contact | null;
}

const emptyFormState: Omit<Contact, 'id'> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  type: ContactType.Clinics,
  notes: '',
};

export const NewContactForm: React.FC<NewContactFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Contact, 'id'>>(initialData || emptyFormState);

  useEffect(() => {
    setFormData(initialData || emptyFormState);
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: false,
    height: 120,
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: [
      "bold", "italic", "underline", "|",
      "ul", "ol", "|",
      "undo", "redo"
    ],
  }), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        {/* <div>
          <label className="block font-medium text-text-secondary mb-1">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
        </div> */}
        <div>
          <label className="block font-medium text-text-secondary mb-1">Company</label>
          <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Company Address</label>
          {/* <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full bg-surface border border-gray-300 rounded-md p-2"
            rows={2}
          ></textarea> */}
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />

        </div>

        <div className="col-span-2">
          <label className="block font-medium text-text-secondary mb-1">Notes</label>
          {/* <textarea
            name="notes"
            value={(formData as any).notes || ""}
            onChange={handleChange}
            className="w-full bg-surface border border-gray-300 rounded-md p-2"
            rows={10}
          ></textarea> */}

          <JoditEditor
            ref={editor}
            value={formData.notes || ""}
            config={config}
            onBlur={(content) => {
              setFormData(prev => ({ ...prev, notes: content }));
            }}
          />



        </div>

        <div>
          <label className="block font-medium text-text-secondary mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
        </div>
        <div className="col-span-2">
          <label className="block font-medium text-text-secondary mb-1">Contact Type</label>
          <select name="type" onChange={handleChange} value={formData.type} className="w-full bg-surface border border-gray-300 rounded-md p-2">
            {Object.values(ContactType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Contact</button>
      </div>
    </form>
  );
};