import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../contexts/DataContext';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '../components/ui/Icons';
import type { Task, Appointment } from '../types';
import { Modal } from '../components/ui/Modal';
import { View, TaskStatus } from '../types';
import { NewTaskForm } from '../components/forms/NewTaskForm';
import { TrashIcon } from '@heroicons/react/16/solid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { splitDateTime } from '../utils/dateUtils';


// Helper to get color classes for task status badges
const getStatusBadgeColorClass = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Enquiry:
            return 'bg-purple-100 text-purple-800';
        case TaskStatus.AIP:
            return 'bg-blue-100 text-blue-800';
        case TaskStatus.FMA:
            return 'bg-amber-100 text-amber-800';
        case TaskStatus.Offered:
            return 'bg-indigo-100 text-indigo-800';
        case TaskStatus.CommissionDue:
            return 'bg-pink-100 text-pink-800';
        case TaskStatus.Completed:
            return 'bg-green-100 text-green-800';
        case TaskStatus.NPW:
            return 'bg-gray-200 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Helper to get color classes for interactive calendar events, including hover states
const getStatusEventColorClass = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Enquiry:
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case TaskStatus.AIP:
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case TaskStatus.FMA:
            return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
        case TaskStatus.Offered:
            return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
        case TaskStatus.CommissionDue:
            return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
        case TaskStatus.Completed:
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case TaskStatus.NPW:
            return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
}

// const CalendarDay: React.FC<{ day: number; date: Date; isCurrentMonth: boolean; isToday: boolean; tasks: Task[]; onTaskClick: (task: Task) => void; }> = ({ day, isCurrentMonth, isToday, tasks, onTaskClick }) => {
//     const dayClasses = `border-t border-r border-gray-200 p-2 h-24 md:h-28 relative flex flex-col ${isCurrentMonth ? 'bg-surface' : 'bg-gray-50'}`;
//     const dayNumberClasses = `text-sm ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : (isCurrentMonth ? 'text-text-primary' : 'text-text-secondary/50')}`;

//     return (
//         <div className={dayClasses}>
//             <div className={dayNumberClasses}>
//                 {day}
//             </div>
//             <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1">
//                 {tasks.map(task => (
//                     <div
//                         key={task.id}
//                         className={`p-1 rounded-md truncate cursor-pointer transition-colors ${getStatusEventColorClass(task.status)}`}
//                         title={task.title}
//                         onClick={() => onTaskClick(task)}
//                     >
//                         {task.title}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

const CalendarDay: React.FC<{
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: Task[];
    appointments: Appointment[];
    onTaskClick: (task: Task) => void;
    onAppointmentClick: (appt: Appointment) => void;
    onAddTask: (date: Date) => void;   // 👈 New prop
}> = ({ day, date, isCurrentMonth, isToday, tasks, appointments, onTaskClick, onAppointmentClick, onAddTask }) => {
    const dayClasses = `border-t border-r border-gray-200 p-2 h-24 md:h-28 relative flex flex-col ${isCurrentMonth ? 'bg-surface' : 'bg-gray-50'}`;
    const dayNumberClasses = `text-sm ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : (isCurrentMonth ? 'text-text-primary' : 'text-text-secondary/50')}`;



    return (
        <div className={`group ${dayClasses}`}>
            <div className="flex justify-between items-start relative">
                <div className={dayNumberClasses}>{day}</div>
                {/* 🟩 Small + button (hidden until hover) */}
                <button
                    onClick={() => onAddTask(date)}
                    // className="text-lg text-primary hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                    className="absolute end-0 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-[#d28302] text-white hover:bg-primary transition-all duration-200"
                    title="Add task"
                >
                    +
                </button>
            </div>

            <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1 group">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`p-1 rounded-md truncate cursor-pointer transition-colors ${getStatusEventColorClass(task.status)}`}
                        title={task.title}
                        onClick={() => onTaskClick(task)}
                    >
                        {task.title}
                    </div>
                ))}

                {/* Appointments */}
                {appointments.map(appt => {
                    const { date, time } = splitDateTime(appt.date);

                    // Format date as DD/MM/YYYY
                    const formattedDate = new Date(date).toLocaleDateString('en-GB');

                    return (
                        <div
                            key={appt.id}
                            className="p-1 rounded-md truncate cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
                            onClick={() => onAppointmentClick(appt)}
                            title={appt.title}
                        >
                            📅 <span className="font-semibold">{appt.title}</span>
                            <br />
                            <span className="text-xs text-gray-600">
                                {formattedDate} {time}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export const CalendarView: React.FC = () => {
    const { tasks, addTask, updateTask, deleteTask, clients, currentUser, setCurrentView, setSelectedClientIdForNav, setSelectedTaskIdForNav, appointments, teamMembers, updateAppointment,     // ✅ ADD THIS
        deleteAppointment } = useContext(DataContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');


    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
    const [isEditingTask, setIsEditingTask] = useState(false);



    // const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    // const clientFromList = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    // const clientName = clientFromList?.name || task.clientName || 'Unknown Client';
    // const caseReference = clientFromList?.caseReference || task.caseReference || 'N/A';

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isEditingAppointment, setIsEditingAppointment] = useState(false);





    const handleAddTaskForDate = (date: Date) => {
        setNewTaskDate(date);
        setIsAddTaskModalOpen(true);
    };


    // const searchResults = useMemo(() => {
    //     if (!searchTerm.trim()) {
    //         return [];
    //     }
    //     const lowercasedFilter = searchTerm.toLowerCase();
    //     const results = tasks.filter(task => {
    //         const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
    //         return client ? client.name.toLowerCase().includes(lowercasedFilter) : false;
    //     });
    //     return results.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    // }, [searchTerm, tasks, clients]);

    // const searchResults = useMemo(() => {
    //     if (!searchTerm.trim()) {
    //         return [];
    //     }

    //     const lowercasedFilter = searchTerm.toLowerCase();

    //     const results = tasks.filter(task => {
    //         const client = task.clientId
    //             ? clients.find(c => c.id === task.clientId)
    //             : null;

    //         if (!client) return false;

    //         const clientNameMatch = client.name.toLowerCase().includes(lowercasedFilter);
    //         const caseRefMatch = client.caseReference
    //             ? client.caseReference.toLowerCase().includes(lowercasedFilter)
    //             : false;

    //         return clientNameMatch || caseRefMatch;

    //     });

    //     return results.sort(
    //         (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    //     );
    // }, [searchTerm, tasks, clients]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];

        const lower = searchTerm.toLowerCase();

        return tasks
            .filter(task => {
                const client = clients.find(c => c.id === task.clientId);

                const clientName = client?.name?.toLowerCase() || "";
                const caseRef = client?.caseReference?.toLowerCase() || "";
                const taskTitle = task.title?.toLowerCase() || "";
                const taskDesc = task.description?.toLowerCase() || "";

                return (
                    clientName.includes(lower) ||
                    caseRef.includes(lower) ||
                    taskTitle.includes(lower) ||
                    taskDesc.includes(lower)
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
            );
    }, [searchTerm, tasks, clients]);







    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const handleSearchResultClick = (task: Task) => {
        setCurrentDate(new Date(task.dueDate));
        handleTaskClick(task);
    };

    const handleNavigateToClient = (clientId: string) => {
        if (clientId) {
            setSelectedClientIdForNav(clientId);
            setCurrentView(View.Leads); // 'Leads' view handles both leads and clients
        }
        handleCloseModal();
    };

    const handleNavigateToTask = (taskId: string) => {
        if (taskId) {
            setSelectedTaskIdForNav(taskId);
            setCurrentView(View.Tasks);
        }
        handleCloseModal();
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const getCalendarGrid = (year: number, month: number) => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const daysInMonth = endDate.getDate();
        const startDayOfWeek = startDate.getDay();

        const grid: Date[] = [];

        const prevMonthEndDate = new Date(year, month, 0);
        const daysInPrevMonth = prevMonthEndDate.getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            grid.push(new Date(year, month - 1, daysInPrevMonth - i));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }

        const endDayOfWeek = endDate.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) {
            grid.push(new Date(year, month + 1, i));
        }

        return grid;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarGrid = getCalendarGrid(year, month);
    const today = new Date();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const clientForSelectedTask = selectedTask?.clientId
        ? clients.find(c => c.id === selectedTask.clientId)
        : null;





    // Pre-group tasks by caseReference


    // const tasksByCase = useMemo(() => {
    //     const map: Record<string, typeof tasks> = {};

    //     tasks.forEach(task => {
    //         if (!task.caseReference) return; // skip tasks without caseReference

    //         if (!map[task.caseReference]) map[task.caseReference] = [];
    //         map[task.caseReference].push(task);
    //     });

    //     // Sort tasks within each case by dueDate
    //     Object.values(map).forEach(taskList =>
    //         taskList.sort(
    //             (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    //         )
    //     );

    //     return map;
    // }, [tasks]);

    type TaskType = Task; // or import Task if already typed

    const tasksByCase: Record<string, TaskType[]> = useMemo(() => {
        const map: Record<string, TaskType[]> = {};

        tasks.forEach(task => {
            if (!task.caseReference) return; // skip tasks without caseReference
            if (!map[task.caseReference]) map[task.caseReference] = [];
            map[task.caseReference].push(task);
        });

        // Sort tasks within each case by dueDate
        Object.values(map).forEach(taskList =>
            taskList.sort(
                (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
        );

        return map;
    }, [tasks]);






    // console.log(tasksByCase);

    //console.log(tasks[1].caseReference);


    const calendarEvents = useMemo(() => {
        return appointments.map(a => ({
            id: a.id,
            title: a.title,
            start: a.time
                ? `${a.date.split("T")[0]}T${a.time}`
                : a.date,
            extendedProps: a,
        }));
    }, [appointments]);



    // function splitDateTime(date: any): { dateTime: any; } {
    //     throw new Error('Function not implemented.');
    // }

    return (
        <div className="p-4 sm:p-8">
            {selectedTask && (
                // <Modal
                //     isOpen={!!selectedTask}
                //     onClose={handleCloseModal}
                //     title="Task Overview"
                // >
                //     <div className="space-y-4">
                //         <div className="flex items-start justify-between">
                //             <h3 className="text-xl font-bold text-text-primary pr-4">{selectedTask.title}</h3>
                //             <span className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${getStatusBadgeColorClass(selectedTask.status)}`}>
                //                 {selectedTask.status}
                //             </span>
                //         </div>
                //         {clientForSelectedTask && (
                //             <p className="text-sm font-semibold text-secondary">Client: {clientForSelectedTask.name}</p>
                //         )}
                //         <p className="text-text-secondary whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
                //         <div className="flex justify-end gap-4 pt-4 border-t">
                //             <button
                //                 onClick={() => handleNavigateToTask(selectedTask.id)}
                //                 className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md"
                //             >
                //                 Task Details
                //             </button>
                //             <button
                //                 onClick={() => setIsEditingTask(true)}
                //                 className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md"
                //             >
                //                 Edit Task
                //             </button>
                //             {clientForSelectedTask && (
                //                 <button
                //                     onClick={() => handleNavigateToClient(clientForSelectedTask.id)}
                //                     className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md"
                //                 >
                //                     Client Details
                //                 </button>
                //             )}
                //         </div>
                //     </div>
                // </Modal>

                <Modal
                    isOpen={!!selectedTask}
                    onClose={() => {
                        setIsEditingTask(false);
                        handleCloseModal();
                    }}
                    title={isEditingTask ? "Edit Task" : "Task Overview"}
                >
                    {isEditingTask && selectedTask ? (
                        <NewTaskForm
                            initialData={selectedTask}
                            onSubmit={(updatedTaskData) => {
                                updateTask(selectedTask.id, updatedTaskData);
                                setIsEditingTask(false);
                                handleCloseModal();
                            }}
                            onCancel={() => setIsEditingTask(false)}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                {/* <h3 className="text-xl font-bold text-text-primary pr-4">{selectedTask?.title} </h3> */}
                                <h3 className="text-xl font-bold text-text-primary pr-4">
                                    {selectedTask?.title}

                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap me-auto ${getStatusBadgeColorClass(selectedTask!.status)}`}>
                                    {selectedTask!.status}
                                </span>
                                {/* 🗑️ Delete Task Button (top-right corner) */}
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this task?")) {
                                            deleteTask(selectedTask!.id);
                                            handleCloseModal();
                                        }
                                    }}
                                    className="px-2  transition-colors"
                                    title="Delete Task"
                                >
                                    <TrashIcon className="size-4 text-red-500" />
                                </button>
                            </div>

                            {clientForSelectedTask && (
                                <p className="text-sm font-semibold text-black">Client: {clientForSelectedTask.name} -
                                    {clientForSelectedTask?.caseReference && (
                                        <span className="text-primary text-xs">
                                            {" "}({clientForSelectedTask.caseReference})
                                        </span>
                                    )}</p>
                            )}
                            <p className="text-text-secondary whitespace-pre-wrap">
                                {selectedTask?.description || 'No description provided.'}
                            </p>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <button
                                    onClick={() => setIsEditingTask(true)}
                                    className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md"
                                >
                                    Edit Task
                                </button>
                                {clientForSelectedTask && (
                                    <button
                                        onClick={() => handleNavigateToClient(clientForSelectedTask.id)}
                                        className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md"
                                    >
                                        Client Details
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column for Search and Results */}
                <div className="lg:col-span-1">
                    <h1 className="text-3xl font-bold mb-8">Calendar</h1>
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            {SearchIcon}
                        </span>
                        <input
                            type="text"
                            placeholder="Search by client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto  
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar]:h-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-black/20
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        hover:[&::-webkit-scrollbar-thumb]:bg-black/30
                        scrollbar-thin
                        scrollbar-thumb-rounded-full
                        scrollbar-track-transparent                    
                    ">
                        {searchTerm.trim() ? (
                            <>
                                <h3 className="font-semibold text-text-primary mb-2">
                                    Search Results ({searchResults.length})
                                </h3>
                                {searchResults.length > 0 ? (
                                    searchResults.map(task => {
                                        const client = clients.find(c => c.id === task.clientId);
                                        const taskDate = new Date(task.dueDate);
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => handleSearchResultClick(task)}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer border"
                                            >
                                                <div className="text-center flex-shrink-0 w-12">
                                                    <p className="text-xs text-text-secondary">
                                                        {taskDate.toLocaleString('default', { month: 'short' })}
                                                    </p>
                                                    <p className="text-lg font-bold text-text-primary">
                                                        {taskDate.getDate()}
                                                    </p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-text-primary leading-tight">
                                                        {task.title}
                                                    </p>
                                                    {client && (
                                                        <p className="text-xs text-secondary mt-0.5">
                                                            {client.name}
                                                        </p>
                                                    )}
                                                    <p
                                                        className={`text-xs mt-1 font-semibold ${getStatusBadgeColorClass(
                                                            task.status
                                                        )} px-1.5 py-0.5 rounded-full inline-block`}
                                                    >
                                                        {task.status}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-text-secondary text-center p-4">
                                        No tasks found for "{searchTerm}".
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="font-semibold text-text-primary mb-2">
                                    All Client Tasks
                                </h3>

                                {Object.entries(tasksByCase).map(([caseRef, caseTasks]) => (
                                    <div key={caseRef}>
                                        <div className="font-semibold text-sm text-text-primary mb-1 mt-3 flex px-2">
                                            {caseTasks[0]?.clientName && (
                                                <div className="text-md">
                                                    {caseTasks[0].clientName}
                                                </div>
                                            )}
                                            <div className="ml-auto text-[10px] text-primary ml-1">({caseRef})</div>

                                        </div>

                                        {caseTasks.map(task => {
                                            const taskDate = new Date(task.dueDate);
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => handleSearchResultClick(task)}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer border mb-2"
                                                >
                                                    <div className="text-center flex-shrink-0 w-12">
                                                        <p className="text-xs text-text-secondary">
                                                            {taskDate.toLocaleString('default', { month: 'short' })}
                                                        </p>
                                                        <p className="text-lg font-bold text-text-primary">
                                                            {taskDate.getDate()}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm text-text-primary leading-tight">
                                                            {task.title}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-1 font-semibold ${getStatusBadgeColorClass(
                                                                task.status
                                                            )} px-1.5 py-0.5 rounded-full inline-block`}
                                                        >
                                                            {task.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}



                            </>
                        )}
                    </div>

                    {/* {searchTerm.trim() && (
                        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
                            <h3 className="font-semibold text-text-primary mb-2">Search Results ({searchResults.length})</h3>
                            {searchResults.length > 0 ? (
                                searchResults.map(task => {
                                    const client = clients.find(c => c.id === task.clientId);
                                    const taskDate = new Date(task.dueDate);
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => handleSearchResultClick(task)}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer border"
                                        >
                                            <div className="text-center flex-shrink-0 w-12">
                                                <p className="text-xs text-text-secondary">{taskDate.toLocaleString('default', { month: 'short' })}</p>
                                                <p className="text-lg font-bold text-text-primary">{taskDate.getDate()}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm text-text-primary leading-tight">{task.title}</p>
                                                {client && <p className="text-xs text-secondary mt-0.5">{client.name}</p>}
                                                <p className={`text-xs mt-1 font-semibold ${getStatusBadgeColorClass(task.status)} px-1.5 py-0.5 rounded-full inline-block`}>{task.status}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-text-secondary text-center p-4">No tasks found for "{searchTerm}".</p>
                            )}
                        </div>
                    )} */}
                </div>

                {/* Right Column for Calendar */}
                <div className="lg:col-span-3">
                    <div className="flex justify-center md:justify-end items-center gap-4 mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-100">{ChevronLeftIcon}</button>
                        <h2 className="text-xl font-semibold w-40 text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-100">{ChevronRightIcon}</button>
                    </div>

                    <div className="bg-surface border border-gray-200 rounded-lg shadow-sm">
                        <div className="grid grid-cols-7">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center font-medium py-3 text-text-secondary border-b border-gray-200">{day}</div>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-7 min-w-[700px] md:min-w-full">
                                {calendarGrid.map((date, index) => {
                                    const tasksForDay = tasks.filter(t => {
                                        const taskDate = new Date(t.dueDate);
                                        return taskDate.getFullYear() === date.getFullYear() &&
                                            taskDate.getMonth() === date.getMonth() &&
                                            taskDate.getDate() === date.getDate();
                                    });


                                    const appointmentsForDay = appointments.filter(a => {
                                        const d = new Date(a.date);
                                        return (
                                            d.getFullYear() === date.getFullYear() &&
                                            d.getMonth() === date.getMonth() &&
                                            d.getDate() === date.getDate()
                                        );
                                    });

                                    return (
                                        // <CalendarDay
                                        //     key={index}
                                        //     date={date}
                                        //     day={date.getDate()}
                                        //     isCurrentMonth={date.getMonth() === month}
                                        //     isToday={date.toDateString() === today.toDateString()}
                                        //     tasks={tasksForDay}
                                        //     appointments={appointmentsForDay}
                                        //     onTaskClick={handleTaskClick}
                                        //     onAppointmentClick={(appt) => {
                                        //         setSelectedAppointment(appt);
                                        //         setIsEditingAppointment(false);
                                        //         // open appointment modal if needed
                                        //     }}
                                        //     onAddTask={handleAddTaskForDate}
                                        //     events={calendarEvents}
                                        // />

                                        <CalendarDay
                                            key={index}
                                            date={date}
                                            day={date.getDate()}
                                            isCurrentMonth={date.getMonth() === month}
                                            isToday={date.toDateString() === today.toDateString()}
                                            tasks={tasksForDay}
                                            appointments={appointmentsForDay}
                                            onTaskClick={handleTaskClick}
                                            onAppointmentClick={(appt) => {
                                                setSelectedAppointment(appt);
                                                setIsEditingAppointment(false);
                                            }}
                                            onAddTask={handleAddTaskForDate}
                                        />



                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                title="Create New Task"
            >
                <NewTaskForm
                    onSubmit={(taskData) => {
                        // Prefill the dueDate from the clicked date
                        const dataWithDate = {
                            ...taskData,
                            // dueDate: newTaskDate ? newTaskDate.toISOString().split('T')[0] : '',
                            dueDate: newTaskDate
                                ? newTaskDate.toLocaleDateString('en-CA') // produces YYYY-MM-DD in local time
                                : '',
                        };
                        addTask(dataWithDate);
                        setIsAddTaskModalOpen(false);
                        setNewTaskDate(null);
                    }}
                    onCancel={() => setIsAddTaskModalOpen(false)}
                    initialData={{
                        dueDate: newTaskDate
                            ? newTaskDate.toLocaleDateString('en-CA') // produces YYYY-MM-DD in local time
                            : '',
                    }}

                />
            </Modal>



            {selectedAppointment && (
                <Modal
                    isOpen={!!selectedAppointment}
                    onClose={() => {
                        setIsEditingAppointment(false);
                        setSelectedAppointment(null);
                    }}
                    title={isEditingAppointment ? "Edit Appointment" : "Appointment Details"}
                >
                    {isEditingAppointment ? (
                        <AppointmentForm
                            appointment={selectedAppointment}
                            clients={clients}
                            teamMembers={teamMembers}
                            onSave={async () => { }}
                            onUpdate={async (id, data) => {
                                await updateAppointment(id, data);
                                setIsEditingAppointment(false);
                                setSelectedAppointment(null);
                            }}
                            onClose={() => setIsEditingAppointment(false)}
                        />
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold">{selectedAppointment.title}</h3>

                            {/* <p className="text-sm text-gray-700">
                                <strong>Date:</strong> {splitDateTime(selectedAppointment.date).date}{" "}
                                <strong>Time:</strong> {splitDateTime(selectedAppointment.date).time}
                            </p> */}

                            <p className="text-sm text-gray-700">
                                <strong>Date:</strong> {splitDateTime(selectedAppointment.date).date}{" "}
                                <strong>Time:</strong> {splitDateTime(selectedAppointment.date).time}
                                {selectedAppointment.endTime && (
                                    <>
                                        {" "}– <strong>End:</strong>{" "}
                                        {selectedAppointment.endTime.slice(0, 5)}
                                    </>
                                )}
                            </p>

                            <p className="text-sm">
                                <strong>Client:</strong>{" "}
                                {clients.find(c => c.id === selectedAppointment.clientId)?.name || "—"}
                            </p>

                            <p className="text-sm">
                                <strong>Assigned To:</strong>{" "}
                                {teamMembers.find(t => t.id === selectedAppointment.assignedTo)?.name || "—"}
                            </p>

                            {selectedAppointment.description && (
                                <p className="text-sm text-gray-600">
                                    {selectedAppointment.description}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsEditingAppointment(true)}
                                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm("Delete this appointment?")) {
                                            deleteAppointment(selectedAppointment.id);
                                            setSelectedAppointment(null);
                                        }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

        </div>

    );

};

