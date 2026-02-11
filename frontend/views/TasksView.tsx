import React, { useState, useContext, useMemo, useEffect } from 'react';
import type { Task } from '../types';
import { View } from '../types';
import { DataContext } from '../contexts/DataContext';
import { Modal } from '../components/ui/Modal';
import { NewTaskForm } from '../components/forms/NewTaskForm';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { formatDbTime } from '@/utils/dateUtils';
import { DeleteIcon, EditIcon } from '@/components/ui/Icons';
export const TasksView: React.FC = () => {
    const {
        tasks,
        addTask,
        updateTask, deleteTask,
        clients,
        selectedTaskIdForNav,
        setSelectedTaskIdForNav,

        setCurrentView,              // ✅ ADD
        setSelectedClientIdForNav,   // ✅ ADD
    } = useContext(DataContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (selectedTaskIdForNav) {
            const taskToOpen = tasks.find(t => t.id === selectedTaskIdForNav);
            if (taskToOpen) {
                setTaskToEdit(taskToOpen);
                setIsModalOpen(true);
                setSelectedTaskIdForNav(null);
            }
        }
    }, [selectedTaskIdForNav, tasks, setSelectedTaskIdForNav]);

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        if (taskToEdit) {
            await updateTask(taskToEdit.id, taskData);
        } else {
            await addTask(taskData);
        }
        setTaskToEdit(null);
        setIsModalOpen(false);
    };

    // const filteredTasks = useMemo(() => {
    //     return tasks.filter(task => {
    //         const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    //         return (
    //             (!statusFilter || task.status === statusFilter) &&
    //             (!clientFilter || (client?.name === clientFilter)) &&
    //             (!assigneeFilter || task.assignedTo === assigneeFilter)
    //         );
    //     }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    // }, [tasks, statusFilter, clientFilter, assigneeFilter, clients]);


    // Table Column Sort
    type SortKey =
        | 'dueDate'
        | 'status'
        | 'created_at'
        | 'assignedTo'
        | 'assignedBy';

    const [sortKey, setSortKey] = useState<SortKey>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    // const filteredTasks = useMemo(() => {
    //     const filtered = tasks.filter(task => {
    //         const client = task.clientId
    //             ? clients.find(c => c.id === task.clientId)
    //             : null;

    //         return (
    //             (!statusFilter || task.status === statusFilter) &&
    //             (!clientFilter || client?.name === clientFilter) &&
    //             (!assigneeFilter || task.assignedTo === assigneeFilter)
    //         );
    //     });

    //     return filtered.sort((a, b) => {
    //         let aVal: any = a[sortKey];
    //         let bVal: any = b[sortKey];

    //         // Date columns
    //         if (sortKey === 'dueDate' || sortKey === 'created_at') {
    //             aVal = new Date(aVal).getTime();
    //             bVal = new Date(bVal).getTime();
    //         }

    //         // String columns
    //         if (typeof aVal === 'string') {
    //             return sortOrder === 'asc'
    //                 ? aVal.localeCompare(bVal)
    //                 : bVal.localeCompare(aVal);
    //         }

    //         return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    //     });
    // }, [
    //     tasks,
    //     clients,
    //     statusFilter,
    //     clientFilter,
    //     assigneeFilter,
    //     sortKey,
    //     sortOrder,
    // ]);

    const filteredTasks = useMemo(() => {
        const search = searchTerm.toLowerCase();

        const filtered = tasks.filter(task => {
            const client = task.clientId
                ? clients.find(c => c.id === task.clientId)
                : null;

            const matchesSearch =
                !search ||
                task.title.toLowerCase().includes(search) ||
                task.status.toLowerCase().includes(search) ||
                task.assignedTo.toLowerCase().includes(search) ||
                task.assignedBy.toLowerCase().includes(search) ||
                client?.name?.toLowerCase().includes(search) ||
                client?.caseReference?.toLowerCase().includes(search);

            return (
                matchesSearch &&
                (!statusFilter || task.status === statusFilter) &&
                (!clientFilter || client?.name === clientFilter) &&
                (!assigneeFilter || task.assignedTo === assigneeFilter)
            );
        });

        return filtered.sort((a, b) => {
            let aVal: any = a[sortKey];
            let bVal: any = b[sortKey];

            if (sortKey === 'dueDate' || sortKey === 'created_at') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (typeof aVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [
        tasks,
        clients,
        statusFilter,
        clientFilter,
        assigneeFilter,
        searchTerm,
        sortKey,
        sortOrder,
    ]);



    const getRelativeDueDate = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDueDate = new Date(dueDate);
        taskDueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
        if (diffDays === 0) return 'Due today';
        return `Due in ${diffDays} day(s)`;
    };

    const caseStatusColors: Record<string, string> = {
        'Initial Enquiry': 'bg-blue-500 text-white',
        'AIP': 'bg-yellow-400 text-black',
        'FMA Submitted': 'bg-purple-500 text-white',
        'Offered': 'bg-orange-500 text-white',
        'Completed': 'bg-green-500 text-white',
        'Renewal': 'bg-gray-600 text-white',
        'On Risk': 'bg-red-500 text-white',
        'Other': 'bg-gray-500 text-black',
    };


    const formatDate = (date?: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };


    const isTaskOverdue = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDueDate = new Date(dueDate);
        taskDueDate.setHours(0, 0, 0, 0);

        return taskDueDate < today;
    };

    // console.log(tasks)


    const SortableTh = ({
        label,
        column,
    }: {
        label: string;
        column: SortKey;
    }) => (
        <th
            onClick={() => handleSort(column)}
            className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none hover:bg-gray-100"
        >
            <span className="flex items-center gap-1">
                {label}
                {sortKey === column && (
                    <span className="text-xs">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </span>
        </th>
    );


    const handleNavigateToClient = (clientId: string) => {
        if (!clientId) return;

        setSelectedClientIdForNav(clientId);
        setCurrentView(View.Leads); // Leads view handles client details
        setIsModalOpen(false);
    };

    const openClientInNewTab = (clientId: string) => {
        const url = `${window.location.origin}/?view=leads&id=${clientId}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };


    return (
        <div className="p-4 sm:p-8">
            <Modal
                title={taskToEdit ? 'Edit Task' : 'Create New Task'}
                isOpen={isModalOpen}
                onClose={() => { setTaskToEdit(null); setIsModalOpen(false); }}
            >
                <NewTaskForm
                    onSubmit={handleSaveTask}
                    onCancel={() => setIsModalOpen(false)}
                    initialData={taskToEdit}
                    //onClientDetailsClick={(clientId) => handleNavigateToClient(clientId)}
                    onClientDetailsClick={openClientInNewTab}
                />
            </Modal>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">Task Manager</h1>
                <button
                    onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md"
                >
                    + New Task
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-sm">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by Client..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border p-2 rounded md:col-span-2"
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border p-2 rounded cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    {[...new Set(tasks.map(t => t.status))].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                {/* <select
                    value={clientFilter}
                    onChange={e => setClientFilter(e.target.value)}
                    className="border p-2 rounded cursor-pointer"
                >
                    <option value="">All Clients</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select> */}

                <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="border p-2 rounded cursor-pointer"
                >
                    <option value="">All Assignees</option>
                    {[...new Set(tasks.map(t => t.assignedTo))].map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        {/* <tr>                            
                            <th className="px-6 py-3 font-medium text-text-secondary">Case Reference</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Case Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Date Due</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Time Due</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Client (Surname)</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Task</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Assigned to</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Assigned by</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Date created</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Action </th>
                        </tr> */}
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Case Reference</th>

                            <SortableTh label="Case Status" column="status" />
                            <SortableTh label="Date Due" column="dueDate" />

                            <th className="px-6 py-3 font-medium text-text-secondary">Time Due</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Client (Surname)</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Task</th>

                            <SortableTh label="Assigned To" column="assignedTo" />
                            <SortableTh label="Assigned By" column="assignedBy" />
                            <SortableTh label="Date Created" column="created_at" />

                            <th className="px-6 py-3 font-medium text-text-secondary">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length === 0 && (
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td colSpan={7} className="text-center py-4 text-gray-500">No tasks found.</td>
                            </tr>
                        )}
                        {filteredTasks.map(task => {
                            const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
                            return (
                                <tr key={task.id}

                                    className={`border-b border-gray-200 text-black ${isTaskOverdue(task.dueDate) ? 'bg-red-100' : ''
                                        }`}

                                >
                                    <td className="px-6 py-2">{client?.caseReference || '—'}</td>
                                    <td className="px-6 py-2">{task.status}</td>
                                    <td className="px-6 py-2">{new Date(task.dueDate).toLocaleDateString()} ({getRelativeDueDate(task.dueDate)})</td>
                                    <td className="px-6 py-2">
                                        {formatDbTime(task.dueTime)}
                                    </td>
                                    <td className="px-6 py-2">{client?.name?.split(' ').slice(-1)[0] || 'Unknown'}</td>
                                    <td className="px-6 py-2">{task.title}</td>
                                    <td className="px-6 py-2">{task.assignedTo}</td>
                                    <td className="px-6 py-2">{task.assignedBy}</td>
                                    <td className="px-6 py-2">{formatDate(task.created_at)}</td>
                                    {/* <td className="px-6 py-4">
                                        {client?.caseStatus && (
                                            <span className={`px-2 py-1 rounded ${caseStatusColors[client.caseStatus] || 'bg-gray-200'}`}>
                                                {client.caseStatus}
                                            </span>
                                        )}
                                    </td> */}
                                    <td className="px-6 py-2 flex gap-5">
                                        <button onClick={() => { setTaskToEdit(task); setIsModalOpen(true); }} className={`text-sm font-semibold text-black ${isTaskOverdue(task.dueDate) ? 'text-black' : ''
                                            }`}>
                                            {EditIcon}
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className={`text-sm font-semibold text-[#ff0000] ${isTaskOverdue(task.dueDate) ? 'text-black' : ''
                                                }`}
                                            aria-label="Delete task"
                                        >
                                            {DeleteIcon}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
