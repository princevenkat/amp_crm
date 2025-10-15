import React, { useState, useEffect } from 'react';
import type { TeamMember } from '../../types';
import { UserRole } from '../../types';
import { EyeIcon, EyeOffIcon } from '../ui/Icons';

interface NewTeamMemberFormProps {
  onSubmit: (member: Omit<TeamMember, 'id' | 'avatar'>) => void;
  onCancel: () => void;
  initialData?: TeamMember | null;
}

const emptyFormState: Omit<TeamMember, 'id' | 'avatar'> = {
  name: '',
  role: UserRole.Adviser,
  email: '',
  password: '',
};

export const NewTeamMemberForm: React.FC<NewTeamMemberFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData ? { name: initialData.name, role: initialData.role, email: initialData.email, password: '' } : emptyFormState);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    setFormData(initialData ? { name: initialData.name, role: initialData.role, email: initialData.email, password: '' } : emptyFormState);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If we are editing and the password is blank, don't submit it
    const submissionData = { ...formData };
    if (initialData && !submissionData.password) {
        delete (submissionData as Partial<typeof submissionData>).password;
    }
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label className="block font-medium text-text-secondary mb-1">Full Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
      </div>
      <div>
        <label className="block font-medium text-text-secondary mb-1">Role</label>
        <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
            {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
            ))}
        </select>
      </div>
      <div>
        <label className="block font-medium text-text-secondary mb-1">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
      </div>
      <div>
        <label className="block font-medium text-text-secondary mb-1">Password</label>
        <div className="relative">
            <input 
                type={isPasswordVisible ? 'text' : 'password'}
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-surface border border-gray-300 rounded-md p-2 pr-10" 
                placeholder={initialData ? "Leave blank to keep current password" : ""}
                required={!initialData} 
            />
            <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
                {isPasswordVisible ? EyeOffIcon : EyeIcon}
            </button>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Member</button>
      </div>
    </form>
  );
};