import React, { useState, useMemo, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';
import type { Client, Applicant, Note, Task } from '../types';
import { UserRole } from '../types';

import { EditIcon, PlusIcon, SearchIcon } from '../components/ui/Icons';
import { NewEnquiryForm } from '../components/forms/NewEnquiryForm';
import { Modal } from '../components/ui/Modal';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

import toast from 'react-hot-toast';

import { NewTaskForm } from '../components/forms/NewTaskForm';
import { TrashIcon } from '@heroicons/react/24/solid';


const NotesView: React.FC<{
    notes: Note[];
    onChange: (notes: Note[]) => void;
    currentAuthor: string;
}> = ({ notes, onChange, currentAuthor }) => {
    const [newNoteText, setNewNoteText] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');

    const handleAddNote = () => {
        if (newNoteText.trim() === '') return;
        const newNote: Note = {
            id: `note-${Date.now()}`,
            text: newNoteText.trim(),
            author: currentAuthor,
            date: new Date().toISOString().split('T')[0],
        };
        onChange([newNote, ...(notes || [])]);
        setNewNoteText('');
    };

    const handleDeleteNote = (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            onChange((notes || []).filter(note => note.id !== id));
        }
    };

    const handleStartEdit = (note: Note) => {
        setEditingNoteId(note.id);
        setEditedText(note.text);
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditedText('');
    };

    const handleSaveEdit = () => {
        if (!editingNoteId) return;
        const updatedNotes = (notes || []).map(note =>
            note.id === editingNoteId ? { ...note, text: editedText } : note
        );
        onChange(updatedNotes);
        setEditingNoteId(null);
        setEditedText('');
    };

    return (
        <div className="space-y-4">
            <div className="border rounded-md p-4">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Add New Note</label>
                <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={3}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Type your note here..."
                />
                <div className="flex justify-end mt-2">
                    <button type="button" onClick={handleAddNote} className="bg-secondary hover:bg-primary text-white font-semibold py-1 px-3 rounded-md text-sm">Add Note</button>
                </div>
            </div>

            <div className="space-y-4">
                {(notes || []).map(note => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
                        {editingNoteId === note.id ? (
                            <>
                                <textarea
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    rows={3}
                                    className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                                    autoFocus
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-text-secondary">
                                        Editing note from {note.date}
                                    </p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleCancelEdit} className="text-xs text-text-secondary hover:underline">Cancel</button>
                                        <button type="button" onClick={handleSaveEdit} className="text-xs text-secondary font-semibold hover:underline">Save</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="whitespace-pre-wrap">{note.text}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-text-secondary">
                                        - {note.author} on  {note.date
                                            ? new Date(note.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "numeric",
                                                year: "numeric",
                                            })
                                            : "N/A"}
                                    </p>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => handleStartEdit(note)} className="text-xs text-secondary font-semibold hover:underline">Edit</button>
                                        <button type="button" onClick={() => handleDeleteNote(note.id)} className="text-xs text-danger hover:underline">Delete</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


const ApplicantDetailsForm: React.FC<{ applicant: Applicant; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }> = ({ applicant, onChange }) => {
    const formFields: { name: keyof Applicant; label: string; type: string; required: boolean; fullWidth?: boolean }[] = [
        { name: 'title', label: 'Title', type: 'select', required: false },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'middleName', label: 'Middle Name', type: 'text', required: false },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'gender', label: 'Gender', type: 'select-gender', required: false },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: false },
        { name: 'homeTelephone', label: 'Home Telephone', type: 'tel', required: false },
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: false },
        { name: 'currentAddress', label: 'Current Address', type: 'text', required: false, fullWidth: false },
        { name: 'email', label: 'Email Address', type: 'email', required: false },
        { name: 'noOfDependents', label: 'No Of Dependents', type: 'number', required: false },
        { name: 'nationality', label: 'Nationality', type: 'text', required: false },
        { name: 'introducer', label: 'Introducer', type: 'text', required: false },

    ];


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(field => (
                <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                    <label className="block font-medium text-text-secondary text-sm mb-1">{field.label}</label>
                    {field.type === 'select' ? (
                        <select name={field.name} value={String(applicant[field.name])} onChange={onChange} className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm" required={field.required}>
                            <option value="">Select...</option>
                            <option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option><option>Dr</option><option>Prof</option>
                        </select>
                    ) : field.type === 'select-gender' ? (
                        <select name={field.name} value={String(applicant[field.name])} onChange={onChange} className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm" required={field.required}>
                            <option value="">Select...</option>
                            <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                        </select>
                    ) : (
                        <input type={field.type} name={field.name} value={String(applicant[field.name])} onChange={onChange} className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm" required={field.required} />
                    )}
                </div>
            ))}
        </div>
    );
};



const EditLeadView: React.FC<{
    lead: Client;
    onSave: (updatedLead: Client) => void;
    onCancel: () => void;
    successMessage?: string | null;
}> = ({ lead, onSave, onCancel, successMessage }) => {
    const [applicants, setApplicants] = useState<Applicant[]>(lead.applicants);
    const [notes, setNotes] = useState<Note[]>(lead.notes || []);
    // const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleApplicantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? (parseInt(value, 10) || 0) : value;

        const updatedApplicants = applicants.map((applicant, index) => {
            if (index === 0) {
                return { ...applicant, [name]: finalValue };
            }
            return applicant;
        });
        setApplicants(updatedApplicants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const applicant1 = applicants[0];
        const updatedLead: Client = {
            ...lead,
            applicants,
            notes,
            name: `${applicant1.firstName} ${applicant1.surname}`,
            email: applicant1.email,
            phone: applicant1.mobileNumber,
        };
        //onSave(updatedLead);

        try {
            await onSave(updatedLead); // async save
            toast.success('Client updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update client.');
        }

    };

    // TASK
    const { tasks, addTask, updateTask, deleteTask } = useContext(DataContext);

    // Task modal state
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    // Filter tasks for this client/lead
    const clientTasks = tasks.filter(task => String(task.clientId) === String(lead.id));
    // Task modal handlers
    const handleOpenCreateTaskModal = () => {
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
    };

    const handleOpenEditTaskModal = (task: Task) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setTaskToEdit(null);
        setIsTaskModalOpen(false);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        try {
            if (taskToEdit) {
                await updateTask(taskToEdit.id, taskData);
                toast.success('Task updated successfully!');
            } else {
                await addTask({ ...taskData, clientId: lead.id });
                toast.success('Task created successfully!');
            }
            handleCloseTaskModal();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save task.');
        }
    };


    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId); // 🧩 make sure DataContext has this method
                toast.success('Task deleted successfully.');
            } catch (error) {
                console.error('Error deleting task:', error);
                toast.error('Failed to delete task.');
            }
        }
    };

    const { currentUser } = useContext(DataContext);
    const canDelete = currentUser && [UserRole.SuperAdmin].includes(currentUser.role);

    return (
        <div className="p-4 sm:p-8">
            {/* Task Modal */}
            <Modal
                title={taskToEdit ? "Edit Task" : "Create New Task"}
                isOpen={isTaskModalOpen}
                onClose={handleCloseTaskModal}
            >
                <NewTaskForm
                    onSubmit={handleSaveTask}
                    onCancel={handleCloseTaskModal}
                    clientId={lead.id}
                    initialData={taskToEdit}
                    hideClientSelector={true}   // ✅ skip search field
                    statusSelector={true}
                />
            </Modal>


            <button onClick={onCancel} className="mb-6 text-sm text-secondary hover:underline">&larr; Back to Pipeline</button>
            <h1 className="text-3xl font-bold mb-2">Edit Pipeline</h1>
            <p className="text-text-secondary mb-8">Editing information for {lead.name}.</p>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-100 text-green-800 border border-green-300 p-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>Applicant Details</CardHeader>
                            <CardContent>
                                <ApplicantDetailsForm applicant={applicants[0]} onChange={handleApplicantChange} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>Notes</CardHeader>
                            <CardContent>
                                <NotesView
                                    notes={notes}
                                    onChange={setNotes}
                                    currentAuthor="Admin User"
                                />
                            </CardContent>
                        </Card>

                        <div className="h-2"></div>

                        {/* Recent Tasks */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <span>Recent Tasks</span>
                                    <button
                                        onClick={handleOpenCreateTaskModal}
                                        type="button"
                                        className="flex items-center gap-1 text-sm text-secondary font-semibold hover:text-primary transition-colors"
                                    >
                                        {PlusIcon}
                                        <span>New Task</span>
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {clientTasks.length > 0 ? (
                                    <ul className="space-y-3">
                                        {clientTasks.map((task) => (
                                            <li
                                                key={task.id}
                                                className="text-sm p-3 bg-gray-50 rounded border relative group"
                                            >
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditTaskModal(task)}
                                                        className="text-gray-400 hover:text-secondary p-1"
                                                    >
                                                        {EditIcon}
                                                    </button>
                                                    {/* 🗑️ Delete Button */}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-gray-400 hover:text-danger p-1"
                                                            aria-label="Delete task"
                                                        >
                                                            <TrashIcon className="size-4 text-red-500" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-text-primary pr-8">{task.title}</p>
                                                {task.description && (
                                                    <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                                                )}
                                                {/* <p className="text-xs text-text-secondary mt-2">Due: {task.dueDate}</p> */}
                                                <p className="text-xs text-text-secondary mt-2">Date:

                                                    {task.dueDate
                                                        ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "numeric",
                                                            year: "numeric",
                                                        })
                                                        : "—"}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-text-secondary">No tasks for this lead.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
                    <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-6 rounded-md">Cancel</button>
                    <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-md">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const PipelineTableRow: React.FC<{
    client: Client;
    onEdit: (client: Client) => void;
    onConvert: (client: Client) => void;
    onDelete: (client: Client) => void;
}> = ({ client, onEdit, onConvert, onDelete }) => {
    const applicant = client.applicants?.[0];


    const handleConvert = () => {
        onConvert(client);
        toast.success(`${client.name} successfully converted to client!`);
    };


    const { currentUser } = useContext(DataContext);
    const canDelete = currentUser && [UserRole.SuperAdmin].includes(currentUser.role);

    const [firstName, ...rest] = client.name.trim().split(' ');
    const surname = rest.join(' ');

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">{applicant?.created_at
                ? new Date(applicant.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                : 'N/A'}</td>
            <td className="px-6 py-4 font-semibold text-text-primary">{firstName || 'N/A'}</td>
            <td className="px-6 py-4 font-semibold text-text-primary">{surname || 'N/A'}</td>
            <td className="px-6 py-4">
                {applicant?.dob
                    ? new Date(applicant?.dob).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "numeric",
                        year: "numeric",
                    })
                    : "N/A"}

            </td>
            <td className="px-6 py-4">{applicant?.introducer || 'N/A'}</td>

            <td className="px-6 py-4">{applicant?.mobileNumber || 'N/A'}</td>
            <td className="px-6 py-4">{applicant?.email || 'N/A'}</td>
            <td className="px-6 py-4">
                <div className="flex gap-4">
                    <button onClick={() => onEdit(client)} className="text-sm font-semibold text-secondary hover:underline">Edit</button>
                    {/* <button onClick={handleConvert} className="text-sm font-semibold text-primary hover:underline">Convert to Client</button> */}

                    <button
                        onClick={() => onConvert(client)}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Convert to Client
                    </button>

                    {canDelete && (
                        <button
                            onClick={() => onDelete(client)}
                            className="text-sm font-semibold text-danger hover:underline"
                        >

                            Delete

                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};


export const DealsView: React.FC = () => {
    const { clients, addClient, updateClient, deleteClient, currentUser, teamMembers } = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreatingEnquiry, setIsCreatingEnquiry] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Client | null>(null);


    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [clientToConvert, setClientToConvert] = useState<Client | null>(null);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState('');

    // const leads = useMemo(() => {
    //     return clients.filter(client =>
    //         (client.status === 'Lead' || client.status === 'Pipeline') &&
    //         (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    //     );
    // }, [searchTerm, clients]);



    type SortKey =
        | 'createdDate'
        | 'firstName'
        | 'surname'
        | 'dob'
        | 'mobile'
        | 'email';
    type SortOrder = 'asc' | 'desc';

    const [sortKey, setSortKey] = useState<SortKey>('createdDate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ active }: { active: boolean }) => (
        <span className="ml-1 text-xs">{active ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
    );

    // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    // const handleSort = (key: SortKey) => {
    //     if (sortKey === key) {
    //         setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    //     } else {
    //         setSortKey(key);
    //         setSortDirection('asc');
    //     }
    // };





    const leads = useMemo(() => {
        const filtered = clients.filter(client =>
            (client.status === 'Lead' || client.status === 'Pipeline') &&
            (
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        return [...filtered].sort((a, b) => {
            const aApp = a.applicants?.[0];
            const bApp = b.applicants?.[0];

            let aVal: any = '';
            let bVal: any = '';

            switch (sortKey) {
                case 'createdDate':
                    aVal = aApp?.created_at || '';
                    bVal = bApp?.created_at || '';
                    break;
                case 'firstName':
                    aVal = aApp?.firstName || '';
                    bVal = bApp?.firstName || '';
                    break;
                case 'surname':
                    aVal = aApp?.surname || '';
                    bVal = bApp?.surname || '';
                    break;
                case 'dob':
                    aVal = aApp?.dob || '';
                    bVal = bApp?.dob || '';
                    break;
                case 'mobile':
                    aVal = aApp?.mobileNumber || '';
                    bVal = bApp?.mobileNumber || '';
                    break;
                case 'email':
                    aVal = aApp?.email || '';
                    bVal = bApp?.email || '';
                    break;
            }

            if (!aVal) return 1;
            if (!bVal) return -1;

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [clients, searchTerm, sortKey, sortOrder]);



    const handleAddEnquiry = async (client: Omit<Client, 'id' | 'avatar'>) => {
        await addClient(client);
        setIsCreatingEnquiry(false);
    };

    // const handleSaveLead = async (updatedLead: Client) => {
    //     await updateClient(updatedLead.id, updatedLead);
    //     setLeadToEdit(null);
    // };
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSaveLead = async (updatedLead: Client) => {
        try {
            await updateClient(updatedLead.id, updatedLead);
            setSuccessMessage('Client updated successfully!');
            // optionally update local state to show updated data
            setLeadToEdit({ ...updatedLead }); // stay on same page
            // clear the message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setSuccessMessage('Failed to update client.');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };


    // const handleConvertToClient = async (clientToConvert: Client) => {
    //     if (window.confirm(`Are you sure you want to convert "${clientToConvert.name}" to a full client?`)) {
    //         await updateClient(clientToConvert.id, { status: 'Active' }); // PATCH request
    //     }
    // };

    const handleConvertClick = (client: Client) => {
        setClientToConvert(client);
        setSelectedAdvisorId('');
        setIsConvertModalOpen(true);
    };


    const handleConfirmConvert = async () => {
        if (!clientToConvert || !selectedAdvisorId) {
            toast.error('Please select an advisor');
            return;
        }

        try {
            // await updateClient(clientToConvert.id, {
            //     status: 'Active',
            //     advisorId: selectedAdvisorId,   // 👈 important
            // });

            const selectedAdvisor = teamMembers.find(
                m => m.id === selectedAdvisorId
            );

            await updateClient(clientToConvert.id, {
                status: 'Active',
                primaryAdvisor_id: selectedAdvisorId,
                primaryAdvisor: selectedAdvisor?.name || ''
            });

            toast.success(`${clientToConvert.name} converted to client`);
            setIsConvertModalOpen(false);
            setClientToConvert(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to convert client');
        }
    };


    // const handleDeleteLead = async (clientToDelete: Client) => {
    //     if (window.confirm(`Are you sure you want to delete "${clientToDelete.name}"?`)) {
    //         try {
    //             await deleteClient(clientToDelete.id);
    //             toast.success(`Client "${clientToDelete.name}" deleted successfully.`);
    //         } catch (error) {
    //             console.error(error);
    //             toast.error('Failed to delete client.');
    //         }
    //     }
    // };
    const handleDeleteLead = async (clientToDelete: Client) => {
        // Confirm deletion only once, not twice
        if (window.confirm(`Are you sure you want to delete "${clientToDelete.name}"?`)) {
            try {
                await deleteClient(clientToDelete.id);  // Calling the function that triggers the backend request
                toast.success(`Client "${clientToDelete.name}" deleted successfully.`);
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete client.');
            }
        }
    };


    if (leadToEdit) {
        return (
            <EditLeadView
                lead={leadToEdit}
                onSave={handleSaveLead}
                onCancel={() => setLeadToEdit(null)}
                successMessage={successMessage}
            />
        );
    }
    const canDelete = currentUser?.role === UserRole.SuperAdmin;






    return (
        <div className="p-4 sm:p-8">
            <Modal title="New Enquiry" isOpen={isCreatingEnquiry} onClose={() => setIsCreatingEnquiry(false)} size="4xl">
                <NewEnquiryForm
                    onSubmit={handleAddEnquiry}
                    onCancel={() => setIsCreatingEnquiry(false)}
                />
            </Modal>

            <Modal
                title="Convert to Client"
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
            >
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                        Assign an advisor before converting this lead to a client.
                    </p>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Select Advisor
                        </label>
                        <select
                            value={selectedAdvisorId}
                            onChange={(e) => setSelectedAdvisorId(e.target.value)}
                            className="w-full border rounded-md p-2 text-sm"
                        >
                            <option value="">Select advisor...</option>
                            {teamMembers
                                .filter(member => member.role === UserRole.Adviser)
                                .map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsConvertModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmConvert}
                            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-secondary"
                        >
                            Convert
                        </button>
                    </div>
                </div>
            </Modal>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Pipeline</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">{SearchIcon}</span>
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreatingEnquiry(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        {PlusIcon}
                        <span>New Enquiry</span>
                    </button>
                </div>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none"
                                onClick={() => handleSort('createdDate')}
                            >
                                Created Date <SortIcon active={sortKey === 'createdDate'} />
                            </th>
                            <th
                                className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none"
                                onClick={() => handleSort('firstName')}>
                                First Name <SortIcon active={sortKey === 'firstName'} />
                            </th>

                            <th
                                className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none"
                                onClick={() => handleSort('surname')}
                            >
                                Surname <SortIcon active={sortKey === 'surname'} />
                            </th>


                            <th className="px-6 py-3 font-medium text-text-secondary">D.o.B</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Introducer</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Mobile Number</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Email</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(client => (
                            <PipelineTableRow
                                key={client.id}
                                client={client}
                                onEdit={setLeadToEdit}
                                onConvert={handleConvertClick}
                                onDelete={handleDeleteLead}
                            />
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                        <p>No leads found in the pipeline.</p>
                        <p className="text-xs mt-1">Click "New Enquiry" to add one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
