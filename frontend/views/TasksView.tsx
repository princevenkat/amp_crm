import React, { useState, useContext, useMemo, useEffect } from 'react';
import type { Task } from '../types';
import { DataContext } from '../contexts/DataContext';
import { PlusIcon, MinusIcon, EditIcon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { NewTaskForm } from '../components/forms/NewTaskForm';

type GroupByType = 'status' | 'client' | 'assignee';

// 🟩 Border color logic
const getTaskBorderColorClass = (dueDate: string, status: Task['status']): string => {
    if (status === 'Completed') return 'border-success';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    if (taskDueDate < today) return 'border-danger';
    if (taskDueDate.getTime() === today.getTime()) return 'border-warning';
    return 'border-secondary';
};



// 🟩 Relative due date display
const getRelativeDueDate = (dueDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    if (diffDays === 0) return 'Due today';
    return `Due in ${diffDays} day(s)`;
};

// 🟩 Single Task Card
const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void }> = ({ task, onEdit }) => {
    const { deleteTask, clients } = useContext(DataContext);
    const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;

    const borderColorClass = getTaskBorderColorClass(task.dueDate, task.status);


    const clientFromList = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    const clientName = clientFromList?.name || task.clientName || 'Unknown Client';
    const caseRef = clientFromList?.caseReference || task.caseReference || 'N/A';
    const caseStatus = clientFromList?.caseStatus || 'N/A';

    console.log(client);

    return (
        <div className={`bg-surface p-4 rounded-lg shadow-sm mb-3 border-l-4 ${borderColorClass} relative group`}>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(task)}
                    className="text-gray-400 hover:text-secondary p-1"
                    aria-label="Edit task"
                >
                    {EditIcon}
                </button>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-danger p-1"
                    aria-label="Delete task"
                >
                    {MinusIcon}
                </button>
            </div>

            <p className="font-semibold text-text-primary pr-12">{task.title}</p>

            {/* {client && (
                <div className="text-xs text-secondary font-medium mt-1">
                    <span>{client.name}</span>
                    <span className="mx-2">|</span>
                    <span>Ref: {client.caseReference}</span>
                </div>
            )} */}

            <div className="text-xs text-secondary font-medium mt-1">
                <span>{clientName}</span>
                <span className="mx-2">|</span>
                <span>Ref: {caseRef}</span>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs text-text-secondary border-t pt-2">
                <div>
                    <strong>Due:</strong>{" "}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}{" "}
                    ({getRelativeDueDate(task.dueDate)})
                </div>
                <div><strong>Assigned to:</strong> {task.assignedTo}</div>
                <div><strong>Status:</strong> <span className="font-semibold text-text-primary">{task.status}</span></div>
                <div><strong>Assigned by:</strong> {task.assignedBy}</div>
                {client?.caseStatus && (
                    <div className="lg:col-span-2"><strong>Case Status:</strong> {client.caseStatus}</div>
                )}
            </div>
        </div>
    );
};

// 🟩 Group of tasks (status/client/assignee)
const TaskGroup: React.FC<{ title: string; tasks: Task[]; onEditTask: (task: Task) => void }> = ({ title, tasks, onEditTask }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-gray-100/50 p-3 rounded-t-lg border border-b-0"
            >
                <h3 className="font-bold text-lg text-text-primary">{title} ({tasks.length})</h3>
                <span className={`transform transition-transform`}>{isOpen ? MinusIcon : PlusIcon}</span>
            </button>
            {isOpen && (
                <div className="border border-t-0 rounded-b-lg p-4 grid lg:grid-cols-3 gap-5">
                    {tasks.length > 0 ? (
                        tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEditTask} />)
                    ) : (
                        <p className="text-sm text-text-secondary">No tasks in this group.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// 🟩 Main view
export const TasksView: React.FC = () => {
    const {
        tasks,
        addTask,
        updateTask,
        clients,
        selectedTaskIdForNav,
        setSelectedTaskIdForNav,
    } = useContext(DataContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [groupBy, setGroupBy] = useState<GroupByType>('status');

    // 🟦 Auto-open modal when navigating to a task
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

    // const groupedTasks = useMemo(() => {
    //     const groups: Record<string, Task[]> = {};

    //     tasks.forEach(task => {
    //         let key: string;
    //         switch (groupBy) {
    //             case 'client': {
    //                 const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    //                 key = client ? client.name : 'No Client';
    //                 break;
    //             }
    //             case 'assignee':
    //                 key = task.assignedTo || 'Unassigned';
    //                 break;
    //             case 'status':
    //             default:
    //                 key = task.status;
    //                 break;
    //         }

    //         if (!groups[key]) groups[key] = [];
    //         groups[key].push(task);
    //     });

    //     Object.keys(groups).forEach(key => {
    //         groups[key].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    //     });

    //     return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    // }, [tasks, groupBy, clients]);

    const groupedTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 🟦 Filter: only overdue or due in next 7 days
        const filteredTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7; // includes overdue
        });

        // 🟦 Sort: overdue first, then soonest due
        filteredTasks.sort((a, b) => {
            const aDate = new Date(a.dueDate).getTime();
            const bDate = new Date(b.dueDate).getTime();
            return aDate - bDate;
        });

        // 🟦 Group by selected mode
        const groups: Record<string, Task[]> = {};

        filteredTasks.forEach(task => {
            let key: string;
            switch (groupBy) {
                case 'client': {
                    const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
                    key = client ? client.name : 'No Client';
                    break;
                }
                case 'assignee':
                    key = task.assignedTo || 'Unassigned';
                    break;
                case 'status':
                default:
                    key = task.status;
                    break;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        });

        // Sort tasks inside each group
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        });

        // Sort group titles alphabetically
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [tasks, groupBy, clients]);


    return (
        <div className="p-4 sm:p-8">

            <Modal
                title={taskToEdit ? 'Edit Task' : 'Create New Task'}
                isOpen={isModalOpen}
                onClose={() => {
                    setTaskToEdit(null);
                    setIsModalOpen(false);
                }}
            >
                <NewTaskForm
                    onSubmit={handleSaveTask}
                    onCancel={() => setIsModalOpen(false)}
                    initialData={taskToEdit}
                />
            </Modal>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Task Manager</h1>
                <div className="flex  sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label htmlFor="group-by" className="text-sm font-medium">Group by:</label>
                        <select
                            id="group-by"
                            value={groupBy}
                            onChange={e => setGroupBy(e.target.value as GroupByType)}
                            className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            <option value="status">Status</option>
                            <option value="client">Client</option>
                            <option value="assignee">Assignee</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setTaskToEdit(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        {PlusIcon}
                        <span>New Task</span>
                    </button>
                </div>
            </div>

            <div>
                {groupedTasks.map(([groupTitle, tasksInGroup]) => (
                    <TaskGroup key={groupTitle} title={groupTitle} tasks={tasksInGroup} onEditTask={(task) => {
                        setTaskToEdit(task);
                        setIsModalOpen(true);
                    }} />
                ))}
            </div>
        </div>
    );
};
