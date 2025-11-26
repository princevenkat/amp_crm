import React, { useState } from 'react';
import type { Client, Applicant } from '../../types';

interface NewEnquiryFormProps {
  onSubmit: (client: Omit<Client, 'id' | 'avatar'>) => void;
  onCancel: () => void;
}

const emptyApplicant: Applicant = {
  title: '', firstName: '', middleName: '', surname: '', gender: '', dob: '',
  homeTelephone: '', mobileNumber: '', email: '', currentAddress: '', noOfDependents: 0, nationality: '', introducer: ''
};

// This component is now simplified to handle a single applicant's data
const ApplicantFormFields: React.FC<{ applicantData: Applicant; onChange: (field: keyof Applicant, value: any) => void }> = ({ applicantData, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;
    onChange(name as keyof Applicant, finalValue);
  };

  const formFields: { name: keyof Applicant; label: string; type: string; required: boolean; fullWidth?: boolean }[] = [
    { name: 'title', label: 'Title', type: 'select', required: false },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'middleName', label: 'Middle Name', type: 'text', required: false },
    { name: 'surname', label: 'Surname', type: 'text', required: true },
    { name: 'gender', label: 'Gender', type: 'select-gender', required: false },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { name: 'homeTelephone', label: 'Home Telephone', type: 'tel', required: false },
    { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true },
    { name: 'currentAddress', label: 'Current Address', type: 'text', required: false, fullWidth: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'noOfDependents', label: 'No Of Dependents', type: 'number', required: false },
    { name: 'nationality', label: 'Nationality', type: 'text', required: false },
    { name: 'introducer', label: 'Introducer', type: 'text', required: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {formFields.map(field => (
        <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
          <label className="block font-medium text-text-secondary mb-1">{field.label}</label>
          {field.name === 'title' ? (
            <select name={field.name} value={applicantData[field.name]} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required}>
              <option value="">Select...</option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
              <option>Ms</option>
              <option>Dr</option>
              <option>Prof</option>
            </select>
          ) : field.name === 'gender' ? (
            <select name={field.name} value={applicantData[field.name]} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required}>
              <option value="">Select...</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          ) : (
            <input type={field.type} name={field.name} value={String(applicantData[field.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required} />
          )}
        </div>
      ))}
    </div>
  );
};


export const NewEnquiryForm: React.FC<NewEnquiryFormProps> = ({ onSubmit, onCancel }) => {
  const [applicantData, setApplicantData] = useState<Applicant>({ ...emptyApplicant });

  const handleApplicantChange = (field: keyof Applicant, value: any) => {
    setApplicantData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const submissionData: Omit<Client, 'id' | 'avatar'> = {
      caseReference: `ENQ-${Date.now().toString().slice(-6)}`,
      primaryAdvisor: 'John Doe', // Default value
      admin: 'Emily White', // Default value
      applicationType: 'Single',
      applicants: [applicantData],
      name: `${applicantData.firstName} ${applicantData.surname}`,
      email: applicantData.email,
      phone: applicantData.mobileNumber,
      status: 'Lead',
      caseStatus: 'Initial Enquiry',
      lastContacted: formatDate(new Date()),   // ✅ Only YYYY-MM-DD
      createdDate: formatDate(new Date()),     // ✅ Only YYYY-MM-DD
      product: { type: 'New Enquiry' },
      value: 0,
      documents: [],
      property: {
        address: applicantData.currentAddress, propertyValue: 0, purchasePrice: 0, dateOfPurchase: '', yearBuilt: '',
        propertyType: '', isExLocal: false, bedrooms: 0, livingRooms: 0, kitchens: 0,
        bathrooms: 0, separateToilets: 0, hasGarageOrParking: false
      }
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      <ApplicantFormFields
        applicantData={applicantData}
        onChange={handleApplicantChange}
      />

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Create Enquiry</button>
      </div>
    </form>
  );
};