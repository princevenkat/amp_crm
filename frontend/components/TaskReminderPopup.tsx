import React, { useContext } from "react";
import { DataContext } from "../contexts/DataContext";

export const TaskReminderPopup: React.FC = () => {
    const {
        taskReminders,
        appointmentReminders,
        reminderPopupOpen,
        closeReminderPopup
    } = useContext(DataContext);

    // If BOTH lists are empty or popup is closed → hide
    if (!reminderPopupOpen || (taskReminders.length === 0 && appointmentReminders.length === 0)) {
        return null;
    }

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
                    Upcoming Reminders
                </h2>

                {/* ---------- TASK REMINDERS ---------- */}
                {taskReminders.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-blue-700 mb-2">Tasks Due Soon</h3>
                        <ul className="space-y-2">
                            {taskReminders.map(task => (
                                <li key={task.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow transition">
                                    <strong className="text-md text-gray-900">{task.title}</strong>

                                    {task.description && (
                                        <div className="text-xs text-gray-700 mt-1">
                                            <span className="font-semibold">Description:</span> {task.description}
                                        </div>
                                    )}

                                    {task.clientName && (
                                        <div className="text-xs text-gray-700 mt-1">
                                            <span className="font-semibold">Client:</span> {task.clientName}
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-700 mt-1">
                                        <span className="font-semibold">Due:</span>{" "}
                                        {new Date(task.dueDate).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ---------- APPOINTMENT REMINDERS ---------- */}
                {appointmentReminders.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-green-700 mb-2">Upcoming Appointments</h3>
                        <ul className="space-y-2">
                            {appointmentReminders.map(appt => (
                                <li key={appt.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow transition">
                                    <strong className="text-md text-gray-900">{appt.title}</strong>

                                    {appt.clientName && (
                                        <div className="text-xs text-gray-700 mt-1">
                                            <span className="font-semibold">Client:</span> {appt.clientName}
                                        </div>
                                    )}

                                    {appt.location && (
                                        <div className="text-xs text-gray-700 mt-1">
                                            <span className="font-semibold">Location:</span> {appt.location}
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-700 mt-1">
                                        <span className="font-semibold">Date:</span>{" "}
                                        {new Date(appt.date).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
