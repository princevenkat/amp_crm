import React, { useState, useMemo, useContext } from 'react';
import { CloseIcon, NotificationIcon } from './ui/Icons';
import { DataContext } from '../contexts/DataContext';
import type { Task } from '../types';
import { View } from '../types';

const getRelativeDueDate = (dueDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    const diffTime = taskDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    if (diffDays === 0) return 'Due today';
    return `Due in ${diffDays} day(s)`;
};

export const NotificationBell: React.FC = () => {
    const { tasks, clients, setCurrentView, setSelectedTaskIdForNav } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);

    const notifications = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tasks
            .filter(task => {
                const taskDueDate = new Date(task.dueDate);
                taskDueDate.setHours(0, 0, 0, 0);
                return task.status !== 'Completed' && taskDueDate <= today;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
    };
    
    const handleNotificationClick = (task: Task) => {
        setSelectedTaskIdForNav(task.id);
        setCurrentView(View.Tasks);
        setIsOpen(false);
    }

    return (
        <>
            <button onClick={handleBellClick} className="text-text-secondary hover:text-text-primary transition-colors relative">
                {NotificationIcon}
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface"></span>
                )}
            </button>

            {/* Overlay */}
            <div
                aria-hidden="true"
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-surface shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 id="notification-panel-title" className="text-lg font-semibold text-text-primary">
                        Notifications ({notifications.length})
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
                        {CloseIcon}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {notifications.length > 0 ? (
                        <ul>
                            {notifications.map(task => {
                                const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
                                return (
                                    <li key={task.id} className="border-b border-gray-100 last:border-b-0">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleNotificationClick(task); }} className="block p-4 hover:bg-gray-50 transition-colors">
                                            <p className="font-semibold text-sm text-text-primary">{task.title}</p>
                                            {client && <p className="text-xs text-secondary mt-1">{client.name}</p>}
                                            <p className="text-xs text-danger mt-1 font-medium">{getRelativeDueDate(task.dueDate)}</p>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="p-4 text-sm text-text-secondary text-center mt-4">No new notifications.</p>
                    )}
                </div>
            </div>
        </>
    );
};