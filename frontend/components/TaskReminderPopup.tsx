// import React, { useContext } from "react";
import React, { useContext, useEffect, useState, useRef } from "react";

import { DataContext } from "../contexts/DataContext";
import { UserRole } from "@/types";
import Draggable from "react-draggable";

export const TaskReminderPopup: React.FC = () => {

    const [minimized, setMinimized] = React.useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);


    const DEFAULT_POSITION = { x: 0, y: 0 };

    const [position, setPosition] = useState(DEFAULT_POSITION);
    const [isSnapping, setIsSnapping] = useState(false);


    const {
        taskReminders,
        appointmentReminders,
        reminderPopupOpen,
        closeReminderPopup,
        currentUser,
    } = useContext(DataContext);

    // If BOTH lists are empty or popup is closed → hide
    // if (!reminderPopupOpen || (taskReminders.length === 0 && appointmentReminders.length === 0)) {
    //     return null;
    // }



    const visibleTaskReminders = React.useMemo(() => {
        if (!currentUser) return [];

        // 👑 Super Admin sees everything
        if (currentUser.role === UserRole.SuperAdmin) {
            return taskReminders;
        }

        // 👤 Everyone else sees ONLY their tasks
        return taskReminders.filter(
            task => task.assignedTo === currentUser.name
        );
    }, [taskReminders, currentUser]);





    const formatDateDMY = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB");
    };

    const formatTimeOnly = (timeStr: string) => {
        if (!timeStr) return "";

        const [hourStr, minute] = timeStr.split(":");
        let hour = Number(hourStr);

        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
    };


    useEffect(() => {
        if (minimized) {
            setIsSnapping(true);
            setPosition(DEFAULT_POSITION);

            // remove snapping after animation finishes
            const timeout = setTimeout(() => {
                setIsSnapping(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [minimized]);


    if (
        !reminderPopupOpen ||
        (visibleTaskReminders.length === 0 && appointmentReminders.length === 0)
    ) {
        return null;
    }


    return (
        // <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <Draggable
            nodeRef={nodeRef}
            handle=".cursor-move"
            position={position}
            onStop={(_, data) => {
                setPosition({ x: data.x, y: data.y });
            }}

        >
            <div ref={nodeRef}
                className={`fixed bottom-6 right-6 z-50 ${isSnapping ? "transition-transform duration-300 ease-out" : ""
                    }`}
            >
                {/* <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl overflow-y-auto max-h-[80vh] relative"> */}


                {/* ================= MINIMIZED VIEW ================= */}
                {minimized ? (
                    <div
                        onClick={() => setMinimized(false)}
                        className="bg-[#002d62] text-white flex items-center justify-center rounded-full shadow-lg cursor-pointer flex items-center gap-2 w-10 h-10"
                    >
                        🔔
                        {/* <span className="text-sm font-semibold">Reminders</span> */}
                    </div>
                ) : (
                    /* ================= FULL POPUP ================= */

                    <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[70vh] flex flex-col">

                        {/* Close Button */}
                        {/* <button
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 transition"
                    onClick={closeReminderPopup}
                >
                    ×
                </button>

                <h2 className="text-md font-bold text-gray-800 mb-4 border-b pb-2 uppercase">
                    Upcoming Reminders
                </h2> */}

                        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#b5620a] rounded-t-xl cursor-move">

                            <h2 className="text-sm font-bold text-white uppercase">
                                Upcoming Reminders
                            </h2>

                            <div className="flex gap-2">
                                {/* Minimize */}
                                <button
                                    onClick={() => setMinimized(!minimized)}
                                    className="w-7 h-7 rounded bg-[#852f13] text-white text-sm font-bold"
                                >
                                    {minimized ? "▢" : "—"}
                                </button>

                                {/* Close */}
                                {/* <button
                                onClick={closeReminderPopup}
                                className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
                            >
                                ×
                            </button> */}
                            </div>
                        </div>
                        {!minimized && (
                            <div className="p-4 overflow-y-auto">
                                {/* ---------- TASK REMINDERS ---------- */}
                                {taskReminders.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-blue-700 mb-2">Tasks Due Soon</h3>
                                        <ul className="space-y-2">
                                            {visibleTaskReminders.map(task => (
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
                                                        {formatDateDMY(task.dueDate)} - {formatTimeOnly(task.dueTime)}
                                                    </div>


                                                    {/* <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            // simple snooze logic
                                                            const newTime = new Date(Date.now() + 5 * 60000);
                                                            console.log("Snoozed until:", newTime);
                                                            closeReminderPopup();
                                                        }}
                                                        className="text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                    >
                                                        Snooze 5 min
                                                    </button>
                                                </div> */}

                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* ---------- APPOINTMENT REMINDERS ---------- */}
                                {/* {appointmentReminders.length > 0 && (
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
                                                        {formatDateDMY(appt.date)}
                                                        {appt.time && (
                                                            <>
                                                                {" "}– {formatTimeOnly(appt.time)}
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )} */}

                            </div>
                        )}
                    </div>
                )}
            </div>
        </Draggable>
    );
};
