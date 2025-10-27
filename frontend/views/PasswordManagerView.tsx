import React, { useState, useContext, useMemo, useEffect } from 'react';
import type { PasswordEntry, TeamMember, SecurityQuestion } from '../types';
import { UserRole } from '../types';
import { DataContext } from '../contexts/DataContext';
import { PlusIcon, EditIcon, MinusIcon, EyeIcon, EyeOffIcon, LinkIcon } from '../components/ui/Icons';
import { Card, CardHeader, CardContent } from '../components/ui/Card';


// --- Form Component ---
const PasswordForm: React.FC<{
    onSubmit: (entry: Omit<PasswordEntry, 'id'>) => void;
    onCancel: () => void;
    initialData?: PasswordEntry | null;
    currentUser: TeamMember;
    teamMembers: TeamMember[];
}> = ({ onSubmit, onCancel, initialData, currentUser, teamMembers }) => {

    const getInitialState = () => {
        if (initialData) {
            // Since API doesn't send back credentials, we create a shell for editing
            // The user must re-enter credentials to update them.
            return {
                ...initialData,
                password: '',
                memorablePhrase: '',
                securityQuestions: initialData.securityQuestions.map(sq => ({ ...sq, answer: '' })),
            };
        }
        return {
            ownerId: currentUser.id,
            service: '',
            accessLink: '',
            username: '',
            password: '',
            memorablePhrase: '',
            securityQuestions: [],
        };
    };

    const [formData, setFormData] = useState(getInitialState());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const updatedSqs = [...formData.securityQuestions];
        updatedSqs[index] = { ...updatedSqs[index], [field]: value };
        setFormData(prev => ({ ...prev, securityQuestions: updatedSqs }));
    };

    const addSq = () => {
        const newSq: SecurityQuestion = { id: `new-${Date.now()}`, question: '', answer: '' };
        setFormData(prev => ({ ...prev, securityQuestions: [...prev.securityQuestions, newSq] }));
    };

    const removeSq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            securityQuestions: prev.securityQuestions.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = { ...formData };

        // Don't submit empty strings for credentials if user didn't want to update them
        if (initialData) {
            if (!submissionData.password) delete (submissionData as any).password;
            if (!submissionData.memorablePhrase) delete (submissionData as any).memorablePhrase;
            submissionData.securityQuestions = submissionData.securityQuestions.filter(sq => sq.answer);
        }

        if ('id' in submissionData) {
            const { id, ...finalData } = submissionData;
            onSubmit(finalData);
        } else {
            onSubmit(submissionData);
        }
    };

    const canSelectOwner = [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser.role);
    const advisers = teamMembers.filter(m => m.role === UserRole.Adviser);

    return (
        <Card>
            <CardHeader>{initialData ? 'Edit Entry' : 'Add New Entry'}</CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    {canSelectOwner && (
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Owner</label>
                            <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required>
                                {advisers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block font-medium text-text-secondary mb-1">Lender / Provider Name</label>
                        <input type="text" name="service" value={formData.service} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block font-medium text-text-secondary mb-1">Access Link</label>
                        <input type="url" name="accessLink" placeholder="https://..." value={formData.accessLink} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required />
                        </div>
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Password</label>
                            <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" placeholder={initialData ? 'Leave blank to keep current' : ''} />
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium text-text-secondary mb-1">Memorable Phrase</label>
                        <input type="text" name="memorablePhrase" value={formData.memorablePhrase || ''} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" placeholder={initialData ? 'Leave blank to keep current' : ''} />
                    </div>

                    <div className="pt-2">
                        <h4 className="font-medium text-text-primary mb-2">Security Questions</h4>
                        <div className="space-y-3">
                            {formData.securityQuestions.map((sq, index) => (
                                <div key={sq.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded-md border">
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input type="text" placeholder={`Question ${index + 1}`} value={sq.question} onChange={(e) => handleSqChange(index, 'question', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                                        <input type="text" placeholder={initialData ? 'Leave blank to keep current' : `Answer ${index + 1}`} value={sq.answer} onChange={(e) => handleSqChange(index, 'answer', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                                    </div>
                                    <button type="button" onClick={() => removeSq(index)} className="p-2 text-danger hover:bg-danger/10 rounded-md">{MinusIcon}</button>
                                </div>
                            ))}
                            <button type="button" onClick={addSq} className="text-sm text-secondary font-semibold flex items-center gap-1">{PlusIcon} Add Question</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


// --- Detail View Component ---
const PasswordDetail: React.FC<{
    entry: PasswordEntry;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ entry, onEdit, onDelete }) => {

    const SecretField: React.FC<{ value?: string }> = ({ value }) => {
        if (!value || value !== 'set') return <span className="text-gray-400 italic">Not set</span>;
        return <span className="font-mono text-text-primary">{'••••••••••••'}</span>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <span>{entry.service}</span>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="text-text-secondary hover:text-secondary p-1">{EditIcon}</button>
                        <button onClick={onDelete} className="text-text-secondary hover:text-danger p-1">{MinusIcon}</button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div>
                    <label className="font-semibold text-text-secondary">Access Link</label>
                    <a href={entry.accessLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:underline break-all">
                        <span>{entry.accessLink}</span>
                        {LinkIcon}
                    </a>
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Username</label>
                    <p>{entry.username}</p>
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Password</label>
                    <SecretField value={entry.password} />
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Memorable Phrase</label>
                    <SecretField value={entry.memorablePhrase} />
                </div>
                {entry.securityQuestions.length > 0 && (
                    <div className="pt-2 border-t">
                        <h4 className="font-semibold text-text-secondary mb-2">Security Questions</h4>
                        <ul className="space-y-3">
                            {entry.securityQuestions.map((sq) => (
                                <li key={sq.id} className="p-3 bg-gray-50 rounded-md border">
                                    <p className="font-medium text-text-primary">{sq.question}</p>
                                    <SecretField value={sq.answer} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main View ---
export const PasswordManagerView: React.FC = () => {
    const {
        passwords,
        currentUser,
        teamMembers,
        addPasswordEntry,
        updatePasswordEntry,
        deletePasswordEntry
    } = useContext(DataContext);

    const [viewingUserId, setViewingUserId] = useState(currentUser?.id || '');
    const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
    const [isFormActive, setIsFormActive] = useState(false); // Combines isCreating and isEditing

    // const canManage = currentUser && [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser.role);
    const canManage = currentUser && [UserRole.Admin, UserRole.SuperAdmin, UserRole.Adviser].includes(currentUser.role);


    // Reset selection when changing the viewed user
    useEffect(() => {
        setSelectedEntry(null);
        setIsFormActive(false);
    }, [viewingUserId]);

    // const displayedPasswords = useMemo(() => {
    //     if (!canManage) {
    //         // Advisers can only see their own. This filtering should ideally happen on the backend.
    //         return passwords.filter(p => p.ownerId === currentUser?.id);
    //     }
    //     return passwords.filter(p => p.ownerId === viewingUserId);
    // }, [passwords, viewingUserId, canManage, currentUser]);
    const displayedPasswords = useMemo(() => {
        if (!canManage) {
            return passwords.filter(p => p.ownerId === currentUser?.id);
        }
        return passwords.filter(p => p.ownerId === viewingUserId);
    }, [passwords, viewingUserId, canManage, currentUser]);

    const handleSelectEntry = (entry: PasswordEntry) => {
        setSelectedEntry(entry);
        setIsFormActive(false);
    }

    const handleAddNew = () => {
        setSelectedEntry(null);
        setIsFormActive(true);
    };

    const handleEdit = () => {
        if (selectedEntry) {
            setIsFormActive(true);
        }
    };

    const handleCancelForm = () => {
        setIsFormActive(false);
    };

    const handleSave = async (entryData: Omit<PasswordEntry, 'id'>) => {
        if (selectedEntry && isFormActive) { // Editing existing
            await updatePasswordEntry(selectedEntry.id, entryData);
        } else { // Creating new
            await addPasswordEntry(entryData);
        }
        setIsFormActive(false);
        setSelectedEntry(null); // Deselect to show updated list
    };

    const handleDelete = async () => {
        if (selectedEntry && await deletePasswordEntry(selectedEntry.id)) {
            setSelectedEntry(null);
        }
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Password Manager</h1>
                <div className="flex items-center gap-4">
                    {/* {canManage && (
                        <select
                            value={viewingUserId}
                            onChange={(e) => setViewingUserId(e.target.value)}
                            className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            {teamMembers.filter(m => m.role === UserRole.Adviser).map(member => (
                                <option key={member.id} value={member.id}>{member.name}'s Passwords</option>
                            ))}
                        </select>
                    )} */}
                    {canManage && (
                        <select
                            value={viewingUserId}
                            onChange={(e) => setViewingUserId(e.target.value)}
                            className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.name}'s Passwords</option>
                            ))}
                        </select>
                    )}
                    <button onClick={handleAddNew} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors">
                        {PlusIcon}
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: List */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>Providers ({displayedPasswords.length})</CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {displayedPasswords.map(entry => (
                                    <li key={entry.id}>
                                        <button
                                            onClick={() => handleSelectEntry(entry)}
                                            className={`w-full text-left p-3 rounded-md text-sm font-medium transition-colors ${selectedEntry?.id === entry.id && !isFormActive ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                                        >
                                            {entry.service}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detail or Form */}
                <div className="md:col-span-2">
                    {isFormActive ? (
                        <PasswordForm
                            onSubmit={handleSave}
                            onCancel={handleCancelForm}
                            initialData={selectedEntry}
                            currentUser={currentUser!}
                            teamMembers={teamMembers}
                        />
                    ) : selectedEntry ? (
                        <PasswordDetail
                            entry={selectedEntry}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-text-secondary">Select an entry or add a new one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};