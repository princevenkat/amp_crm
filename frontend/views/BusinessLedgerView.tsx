import React, { useContext, useState, useMemo, useEffect } from 'react';
import { DataContext } from '../contexts/DataContext';
import type { LedgerEntry } from '../types';
import { PlusIcon, EditIcon, MinusIcon, DeleteIcon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { NewLedgerEntryForm } from '../components/forms/NewLedgerEntryForm';
import { UserRole } from '../types';
import { formatCurrency } from '@/utils/formatCurrency';


import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const BusinessLedgerView: React.FC = () => {
    const {
        ledger,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        currentUser,
        teamMembers,
        clients,
    } = useContext(DataContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<LedgerEntry | null>(null);
    const [viewingUserId, setViewingUserId] = useState<string>('');


    const [searchQuery, setSearchQuery] = useState(''); // For search box
    const [typeFilter, setTypeFilter] = useState(''); // For type dropdown

    // ✅ Determine if user has full access
    const canViewAll = [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser?.role ?? '');

    // ✅ Initialize viewingUserId for admins
    // useEffect(() => {
    //     if (canViewAll && teamMembers.length > 0 && !viewingUserId) {
    //         setViewingUserId(teamMembers[0].id);
    //     } else if (!canViewAll && currentUser) {
    //         setViewingUserId(currentUser.id);
    //     }
    // }, [teamMembers, canViewAll, currentUser, viewingUserId]);


    useEffect(() => {
        if (!canViewAll && currentUser) {
            setViewingUserId(currentUser.id); // non-admins see only themselves
        }
    }, [canViewAll, currentUser]);

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
    // const filteredLedger = useMemo(() => {
    //     if (!ledger || ledger.length === 0) return [];

    //     if (canViewAll) {
    //         return viewingUserId
    //             ? ledger.filter((entry) => entry.ownerId === viewingUserId)
    //             : [];
    //     }
    //     return ledger;
    // }, [ledger, viewingUserId, canViewAll]);


    const ledgerWithCaseRef = useMemo(() => {
        if (!ledger) return [];

        return ledger.map((entry) => {
            const client = clients?.find(c => c.name === entry.clientName);
            return {
                ...entry,
                caseReference: client?.caseReference || '—',
            };
        });
    }, [ledger, clients]);

    const filteredLedger = useMemo(() => {
        if (!ledgerWithCaseRef || ledgerWithCaseRef.length === 0) return [];

        let result = canViewAll
            ? viewingUserId
                ? ledgerWithCaseRef.filter((entry) => entry.ownerId === viewingUserId)
                : ledgerWithCaseRef
            : ledgerWithCaseRef.filter((entry) => entry.ownerId === currentUser?.id);

        // Apply search filter
        if (searchQuery) {
            result = result.filter((entry) =>
                entry.clientName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (typeFilter) {
            result = result.filter((entry) => entry.type === typeFilter);
        }

        return result;
    }, [ledgerWithCaseRef, viewingUserId, canViewAll, currentUser?.id, searchQuery, typeFilter]);

    // const filteredLedger = useMemo(() => {
    //     if (!ledger || ledger.length === 0) return [];

    //     let result = canViewAll
    //         ? viewingUserId
    //             ? ledger.filter((entry) => entry.ownerId === viewingUserId)
    //             : ledger
    //         : ledger.filter((entry) => entry.ownerId === currentUser?.id);

    //     // Apply search filter
    //     if (searchQuery) {
    //         result = result.filter((entry) =>
    //             entry.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    //         );
    //     }

    //     // Apply type filter
    //     if (typeFilter) {
    //         result = result.filter((entry) => entry.type === typeFilter);
    //     }

    //     return result;
    // }, [ledger, viewingUserId, canViewAll, currentUser?.id, searchQuery, typeFilter]);



    const sortedLedger = useMemo(() => {
        return [...filteredLedger].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [filteredLedger]);

    // Unique types for dropdown
    const uniqueTypes = useMemo(() => Array.from(new Set(ledger.map((e) => e.type))), [ledger]);


    const typeStyles = {
        'Commission': 'bg-success/20 text-success',
        'Fee': 'bg-accent/20 text-accent',
        'Expense': 'bg-danger/20 text-danger',
        'Broker Fee': 'bg-warning/20 text-warning',
        'Procuration Fee': 'bg-info/20 text-info',
        'Referral Fee': 'bg-purple/20 text-purple',
        'Other': 'bg-gray-200 text-gray-800',
    };


    // Add state for filters
    const [exportYear, setExportYear] = useState('');
    const [exportMonth, setExportMonth] = useState('');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');

    const handleExportExcel = () => {
        // Use the already filteredLedger instead of the raw ledger
        let filtered = [...filteredLedger];

        // Further filter by exportYear
        if (exportYear) {
            filtered = filtered.filter(
                (e) => new Date(e.date).getFullYear().toString() === exportYear
            );
        }

        // Filter by exportMonth
        if (exportMonth) {
            filtered = filtered.filter(
                (e) => (new Date(e.date).getMonth() + 1).toString() === exportMonth
            );
        }

        // Filter by date range
        if (exportStartDate) {
            const start = new Date(exportStartDate);
            filtered = filtered.filter((e) => new Date(e.date) >= start);
        }
        if (exportEndDate) {
            const end = new Date(exportEndDate);
            filtered = filtered.filter((e) => new Date(e.date) <= end);
        }

        if (filtered.length === 0) {
            alert("No data to export for selected filter");
            return;
        }

        const worksheetData = filtered.map((e) => {
            const [firstName, ...rest] = e.clientName?.split(' ') || [];
            const lastName = rest.join(' ');
            return {
                Date: new Date(e.date).toLocaleDateString("en-GB"),
                Firstname: firstName,
                Surname: lastName,
                CaseRef: e.caseReference || '—',
                Type: e.type,
                Amount: e.amount,
                PayStatus: e.pay_status,
            };
        });

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ledger');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `LedgerExport_${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setExportYear('');
        setExportMonth('');
        setExportStartDate('');
        setExportEndDate('');
        if (canViewAll) setViewingUserId(''); // reset user dropdown for admins
    };

    return (
        <div className="p-4 sm:p-8">
            <Modal
                title={entryToEdit ? 'Edit Ledger Entry' : 'New Ledger Entry'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <NewLedgerEntryForm
                    onSubmit={handleSaveEntry}
                    onCancel={handleCloseModal}
                    initialData={entryToEdit}
                />
            </Modal>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Business Ledger</h1>

                {/* {canViewAll && teamMembers.length > 0 && (
                    <select
                        value={viewingUserId}
                        onChange={(e) => setViewingUserId(e.target.value)}
                        className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        <option key="" value="">
                            All
                        </option>
                        {teamMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}'s Ledger
                            </option>
                        ))}
                    </select>
                )} */}

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                >
                    {PlusIcon}
                    <span>New Entry</span>
                </button>
            </div>

            <div className="flex gap-10 justify-between items-center">
                <div className="flex flex-wrap gap-2 mb-4">
                    <input
                        type="number"
                        placeholder="Year"
                        value={exportYear}
                        onChange={(e) => setExportYear(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="number"
                        placeholder="Month (1-12)"
                        value={exportMonth}
                        onChange={(e) => setExportMonth(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="date"
                        placeholder="End Date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <button
                        onClick={handleExportExcel}
                        className="bg-primary text-white px-4 py-1 rounded"
                    >
                        Export Excel
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by client name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-1/2"
                    />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-1/2"
                    >
                        <option value="">All Types</option>
                        {uniqueTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Firstname</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Surname</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Case Ref</th>

                            {/* <th className="px-6 py-3 font-medium text-text-secondary">Description</th> */}
                            <th className="px-6 py-3 font-medium text-text-secondary">Type</th>
                            <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Pay Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLedger.map((entry) => {
                            const [firstName, ...rest] = entry.clientName?.split(' ') || [];
                            const lastName = rest.join(' ');
                            return (

                                <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {entry.date
                                            ? new Date(entry.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "numeric",
                                                year: "numeric",
                                            })
                                            : "—"}
                                    </td>
                                    {/* <td className="px-6 py-4">{entry.clientName}</td> */}

                                    <td className="px-6 py-4">{firstName}</td>
                                    <td className="px-6 py-4">{lastName}</td>

                                    <td className="px-6 py-4">{entry.caseReference || '—'}</td>
                                    {/* <td className="px-6 py-4 font-semibold text-text-primary">{entry.description}</td> */}
                                    <td className="px-6 py-4">


                                        {entry.type}
                                        {/* <span
                                        className={`px-2 py-1 text-xs rounded-full ${entry.type === 'Commission'
                                            ? 'bg-success/20 text-success'
                                            : entry.type === 'Fee'
                                                ? 'bg-accent/20 text-accent'
                                                : 'bg-danger/20 text-danger'
                                            }`}
                                    >
                                        {entry.type}
                                    </span> */}
                                    </td>
                                    <td
                                        className={`px-6 py-4 font-semibold text-right ${entry.amount >= 0 ? 'text-success' : 'text-danger'
                                            }`}
                                    >
                                        {/* ${Math.abs(entry.amount).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })} */}
                                        {formatCurrency(Math.abs(entry.amount))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${entry.pay_status === 'Paid'
                                                ? 'bg-success/20 text-success'
                                                : 'bg-warning/20 text-warning'
                                                }`}
                                        >
                                            {entry.pay_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleOpenEditModal(entry)}
                                                className="text-blue-900 hover:text-secondary"
                                            >
                                                {EditIcon}
                                            </button>
                                            <button
                                                onClick={() => deleteLedgerEntry(entry.id)}
                                                className="text-red-500 hover:text-danger"
                                            >
                                                {DeleteIcon}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
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
