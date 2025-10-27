import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../contexts/DataContext';
import type { LedgerEntry } from '../types';
import { PlusIcon, EditIcon, MinusIcon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { NewLedgerEntryForm } from '../components/forms/NewLedgerEntryForm';
import { UserRole } from '../types'; // 👈 ensure this exists in your types

export const BusinessLedgerView: React.FC = () => {
    const { ledger, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry, currentUser, teamMembers } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<LedgerEntry | null>(null);
    const [viewingUserId, setViewingUserId] = useState(currentUser?.id || '');

    // ✅ Check role permissions
    const canViewAll = [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser?.role);

    const handleOpenCreateModal = () => {
        setEntryToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (entry: LedgerEntry) => {
        setEntryToEdit(entry);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEntryToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveEntry = async (entryData: Omit<LedgerEntry, 'id'>) => {
        if (entryToEdit) {
            await updateLedgerEntry(entryToEdit.id, entryData);
        } else {
            await addLedgerEntry(entryData);
        }
        handleCloseModal();
    };

    // ✅ Filter ledger based on role and selected user
    const filteredLedger = useMemo(() => {
        if (canViewAll) {
            return ledger.filter(entry => entry.ownerId === viewingUserId);
        }
        // advisers see only their own ledger (backend should already limit it)
        return ledger;
    }, [ledger, viewingUserId, canViewAll]);

    const sortedLedger = useMemo(() => {
        return [...filteredLedger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredLedger]);

    return (
        <div className="p-4 sm:p-8">
            <Modal title={entryToEdit ? "Edit Ledger Entry" : "New Ledger Entry"} isOpen={isModalOpen} onClose={handleCloseModal}>
                <NewLedgerEntryForm
                    onSubmit={handleSaveEntry}
                    onCancel={handleCloseModal}
                    initialData={entryToEdit}
                />
            </Modal>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Business Ledger</h1>

                {/* ✅ Admins/SuperAdmins can choose which user ledger to view */}
                {canViewAll && (
                    <select
                        value={viewingUserId}
                        onChange={(e) => setViewingUserId(e.target.value)}
                        className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}'s Ledger
                            </option>
                        ))}
                    </select>
                )}

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                >
                    {PlusIcon}
                    <span>New Entry</span>
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Client</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Description</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Type</th>
                            <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLedger.map(entry => (
                            <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">{entry.date}</td>
                                <td className="px-6 py-4">{entry.clientName}</td>
                                <td className="px-6 py-4 font-semibold text-text-primary">{entry.description}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${entry.type === 'Commission'
                                            ? 'bg-success/20 text-success'
                                            : entry.type === 'Fee'
                                                ? 'bg-accent/20 text-accent'
                                                : 'bg-danger/20 text-danger'
                                            }`}
                                    >
                                        {entry.type}
                                    </span>
                                </td>
                                <td
                                    className={`px-6 py-4 font-semibold text-right ${entry.amount >= 0 ? 'text-success' : 'text-danger'
                                        }`}
                                >
                                    ${Math.abs(entry.amount).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleOpenEditModal(entry)}
                                            className="text-text-secondary hover:text-secondary"
                                        >
                                            {EditIcon}
                                        </button>
                                        <button
                                            onClick={() => deleteLedgerEntry(entry.id)}
                                            className="text-text-secondary hover:text-danger"
                                        >
                                            {MinusIcon}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedLedger.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                        <p>No ledger entries found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};




// import React, { useContext, useState, useMemo } from 'react';
// import { DataContext } from '../contexts/DataContext';
// import type { LedgerEntry } from '../types';
// import { PlusIcon, EditIcon, MinusIcon } from '../components/ui/Icons';
// import { Modal } from '../components/ui/Modal';
// import { NewLedgerEntryForm } from '../components/forms/NewLedgerEntryForm';

// export const BusinessLedgerView: React.FC = () => {
//     const { ledger, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } = useContext(DataContext);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [entryToEdit, setEntryToEdit] = useState<LedgerEntry | null>(null);

//     const handleOpenCreateModal = () => {
//         setEntryToEdit(null);
//         setIsModalOpen(true);
//     };

//     const handleOpenEditModal = (entry: LedgerEntry) => {
//         setEntryToEdit(entry);
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setEntryToEdit(null);
//         setIsModalOpen(false);
//     };

//     const handleSaveEntry = async (entryData: Omit<LedgerEntry, 'id'>) => {
//         if (entryToEdit) {
//             await updateLedgerEntry(entryToEdit.id, entryData);
//         } else {
//             await addLedgerEntry(entryData);
//         }
//         handleCloseModal();
//     };

//     const sortedLedger = useMemo(() => {
//         return [...ledger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     }, [ledger]);

//     return (
//         <div className="p-4 sm:p-8">
//             <Modal title={entryToEdit ? "Edit Ledger Entry" : "New Ledger Entry"} isOpen={isModalOpen} onClose={handleCloseModal}>
//                 <NewLedgerEntryForm
//                     onSubmit={handleSaveEntry}
//                     onCancel={handleCloseModal}
//                     initialData={entryToEdit}
//                 />
//             </Modal>
//             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
//                 <h1 className="text-3xl font-bold">Business Ledger</h1>
//                 <button
//                     onClick={handleOpenCreateModal}
//                     className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
//                 >
//                     {PlusIcon}
//                     <span>New Entry</span>
//                 </button>
//             </div>
//             <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
//                 <table className="min-w-full text-sm text-left">
//                     <thead className="bg-gray-50 border-b border-gray-200">
//                         <tr>
//                             <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
//                             <th className="px-6 py-3 font-medium text-text-secondary">Client</th>
//                             <th className="px-6 py-3 font-medium text-text-secondary">Description</th>
//                             <th className="px-6 py-3 font-medium text-text-secondary">Type</th>
//                             <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
//                             <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sortedLedger.map(entry => (
//                             <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
//                                 <td className="px-6 py-4">{entry.date}</td>
//                                 <td className="px-6 py-4">{entry.clientName}</td>
//                                 <td className="px-6 py-4 font-semibold text-text-primary">{entry.description}</td>
//                                 <td className="px-6 py-4">
//                                     <span className={`px-2 py-1 text-xs rounded-full ${entry.type === 'Commission' ? 'bg-success/20 text-success' : entry.type === 'Fee' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
//                                         {entry.type}
//                                     </span>
//                                 </td>
//                                 <td className={`px-6 py-4 font-semibold text-right ${entry.amount >= 0 ? 'text-success' : 'text-danger'}`}>
//                                     ${Math.abs(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <div className="flex items-center gap-4">
//                                         <button onClick={() => handleOpenEditModal(entry)} className="text-text-secondary hover:text-secondary">{EditIcon}</button>
//                                         <button onClick={() => deleteLedgerEntry(entry.id)} className="text-text-secondary hover:text-danger">{MinusIcon}</button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {sortedLedger.length === 0 && (
//                     <div className="text-center py-12 text-text-secondary">
//                         <p>No ledger entries found.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };