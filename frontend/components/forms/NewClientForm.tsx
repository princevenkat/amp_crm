import React, { useState } from 'react';
import type { Client, Applicant, CaseStatus } from '../../types';

interface NewClientFormProps {
  onSubmit: (client: Omit<Client, 'id' | 'avatar'>) => void;
  onCancel: () => void;
}

const advisors = ['John Doe', 'Jane Smith', 'Peter Jones'];
const admins = ['Emily White', 'Michael Brown'];
const caseStatuses: CaseStatus[] = ['Initial Enquiry', 'AIP', 'FMA Submitted', 'Offered', 'Completed', 'Renewal', ''];


const emptyApplicant: Applicant = {
  title: '', firstName: '', middleName: '', surname: '', gender: '', dob: '',
  homeTelephone: '', mobileNumber: '', email: '', currentAddress: '', noOfDependents: 0, nationality: '', introducer: ''
};

// Fix: Define a type for the form's state to prevent type widening on properties like `status`.
type NewClientState = Omit<Client, 'id' | 'avatar' | 'name' | 'email' | 'phone' | 'applicationType'> & {
  numApplicants: number;
};

const ApplicantFormFields: React.FC<{ applicantIndex: number; applicantData: Applicant; onChange: (index: number, field: keyof Applicant, value: string) => void }> = ({ applicantIndex, applicantData, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(applicantIndex, name as keyof Applicant, value);
  };

  const formFields: { name: keyof Applicant; label: string; type: string; required: boolean; fullWidth?: boolean }[] = [
    { name: 'title', label: 'Title', type: 'select', required: false },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'middleName', label: 'Middle Name', type: 'text', required: false },
    { name: 'surname', label: 'Surname', type: 'text', required: true },
    { name: 'gender', label: 'Gender', type: 'select-gender', required: false },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { name: 'homeTelephone', label: 'Home Telephone', type: 'tel', required: false },
    { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: false },
    { name: 'currentAddress', label: 'Current Address', type: 'text', required: false, fullWidth: true },
    { name: 'email', label: 'Email Address', type: 'email', required: false },
    { name: 'noOfDependents', label: 'No Of Dependents', type: 'number', required: false },
    { name: 'nationality', label: 'Nationality', type: 'text', required: false },
  ];

  return (
    <div className="pt-4 border-t mt-4">
      <h3 className="font-semibold text-lg text-text-primary mb-4">Applicant {applicantIndex + 1}</h3>
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
    </div>
  );
};


export const NewClientForm: React.FC<NewClientFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<NewClientState>({
    caseReference: `CASE-${Date.now().toString().slice(-6)}`,
    primaryAdvisor: advisors[0],
    admin: admins[0],
    numApplicants: 1,
    applicants: Array(4).fill(null).map(() => ({ ...emptyApplicant })),
    caseStatus: 'Initial Enquiry',
    // Dummy data for fields not in this form but required by type
    status: 'Lead',
    lastContacted: new Date().toISOString().split('T')[0],
    createdDate: new Date().toISOString().split('T')[0],
    product: { type: 'New Enquiry' },
    property: {
      address: '', propertyValue: 0, purchasePrice: 0, dateOfPurchase: '', yearBuilt: '',
      propertyType: '',
      isExLocal: false, bedrooms: 0, livingRooms: 0, kitchens: 0,
      bathrooms: 0, separateToilets: 0, hasGarageOrParking: false
    }
  });

  const handleApplicantChange = (index: number, field: keyof Applicant, value: string) => {
    const updatedApplicants = [...formData.applicants];
    const finalValue = field === 'noOfDependents' ? (parseInt(value, 10) || 0) : value;
    updatedApplicants[index] = { ...updatedApplicants[index], [field]: finalValue as any };
    setFormData(prev => ({ ...prev, applicants: updatedApplicants }));
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numApplicants' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const applicantsToSubmit = formData.applicants.slice(0, formData.numApplicants);

    const applicant1 = formData.applicants[0];

    // FIX: Explicitly define applicationType to prevent TypeScript from widening it to a generic 'string' type, ensuring it matches the 'Single' | 'Joint' requirement.
    const applicationType: Client['applicationType'] = formData.numApplicants > 1 ? 'Joint' : 'Single';

    const submissionData = {
      ...formData,
      applicationType: applicationType,
      applicants: applicantsToSubmit,
      name: `${applicant1.firstName} ${applicant1.surname}`,
      email: applicant1.email,
      phone: applicant1.mobileNumber,
      property: { // Populate address from applicant 1 for now
        ...formData.property,
        address: applicant1.currentAddress,
      }
    };
    // remove numApplicants before submitting
    const { numApplicants, ...clientData } = submissionData;
    onSubmit(clientData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-text-secondary mb-1">Number of Applicants</label>
          <select name="numApplicants" value={formData.numApplicants} onChange={handleGeneralChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Our Case Reference</label>
          <input type="text" name="caseReference" value={formData.caseReference} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2" readOnly />
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Case Status</label>
          <select name="caseStatus" value={formData.caseStatus} onChange={handleGeneralChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
            {caseStatuses.map(status => <option key={status} value={status}>{status || 'None'}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Primary Advisor</label>
          <select name="primaryAdvisor" value={formData.primaryAdvisor} onChange={handleGeneralChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
            {advisors.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium text-text-secondary mb-1">Admin</label>
          <select name="admin" value={formData.admin} onChange={handleGeneralChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
            {admins.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      {Array.from({ length: formData.numApplicants }).map((_, index) => (
        <ApplicantFormFields
          key={index}
          applicantIndex={index}
          applicantData={formData.applicants[index]}
          onChange={handleApplicantChange}
        />
      ))}

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Create Client</button>
      </div>
    </form>
  );
};