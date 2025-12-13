import React, { useContext } from "react";
import { DataContext } from "../contexts/DataContext";

export const TaskReminderPopup: React.FC = () => {
    const { taskReminders, reminderPopupOpen, closeReminderPopup } = useContext(DataContext);

    if (!reminderPopupOpen || taskReminders.length === 0) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl overflow-y-auto max-h-[80vh] relative">

                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 transition"
                    onClick={closeReminderPopup}
                >
                    ×
                </button>

                <h2 className="text-md font-bold text-gray-800 mb-4 border-b pb-2 uppercase">
                    Upcoming Task Reminders
                </h2>

                <ul className="space-y-2">
                    {taskReminders.map(task => (
                        <li key={task.id} className="border rounded-lg p-4 hover:shadow-lg transition bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-md text-gray-900">{task.title}</strong>
                                {/* <span className="text-xs font-medium text-white bg-blue-500 px-2 py-1 rounded">
                                    {task.status}
                                </span> */}
                            </div>

                            {task.description && (
                                <div className="text-xs text-gray-700 mb-1">
                                    <span className="font-semibold">Description:</span> {task.description}
                                </div>
                            )}

                            {task.clientName && (
                                <div className="text-xs text-gray-700 mb-1">
                                    <span className="font-semibold text-primary">Client:</span> {task.clientName}
                                </div>
                            )}

                            {task.caseReference && (
                                <div className="text-xs text-gray-700 mb-1">
                                    <span className="font-semibold">Case Ref:</span> {task.caseReference}
                                </div>
                            )}

                            <div className="text-xs text-gray-700 mb-1">
                                <span className="font-semibold">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
                            </div>

                            <div className="text-xs text-gray-700 mb-1">
                                <span className="font-semibold">Assigned By:</span> {task.assignedBy} |
                                <span className="font-semibold ml-2">Assigned To:</span> {task.assignedTo}
                            </div>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};
