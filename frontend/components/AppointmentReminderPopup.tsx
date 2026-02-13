import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../contexts/DataContext";


export const AppointmentReminderPopup: React.FC = () => {
    const {
        appointmentReminders,
        // appointmentPopupOpen,
        closeAppointmentPopup,
        clients,
        teamMembers,
    } = useContext(DataContext);






    const [visibleAppointments, setVisibleAppointments] = useState<any[]>([]);


    const TEST_MODE = false;
    useEffect(() => {
        const checkReminders = () => {

            // 🧪 TEST MODE — popup every 5 seconds
            if (TEST_MODE) {
                if (appointmentReminders.length > 0) {
                    setVisibleAppointments([appointmentReminders[0]]);
                }
                return;
            }

            // ---------------- REAL LOGIC BELOW ----------------

            const nowTime = Date.now();
            const storedStages: Record<string, number[]> =
                JSON.parse(localStorage.getItem("appointmentReminderStages") || "{}");

            const updatedStages = { ...storedStages };
            const toShow: any[] = [];

            appointmentReminders.forEach((a: any) => {
                if (a.status === "Completed" || a.isCompleted) return;

                let startDateTime: Date;

                if (a.time) {
                    const [y, m, d] = a.date.split(" ")[0].split("-");
                    const [hh, mm] = a.time.split(":");
                    startDateTime = new Date(y, m - 1, d, hh, mm);
                } else {
                    startDateTime = new Date(a.date);
                }

                let endDateTime: Date | null = null;

                if (a.endTime) {
                    const [y, m, d] = a.date.split(" ")[0].split("-");
                    const [hh, mm] = a.endTime.split(":");
                    endDateTime = new Date(y, m - 1, d, hh, mm);
                }

                if (endDateTime && endDateTime.getTime() <= nowTime) return;

                const diffMinutes =
                    (startDateTime.getTime() - nowTime) / (1000 * 60);

                const fired = updatedStages[a.id] || [];

                if (diffMinutes <= 0 && !fired.includes(0)) {
                    updatedStages[a.id] = [...fired, 0];
                    toShow.push(a);
                } else if (diffMinutes <= 5 && !fired.includes(5)) {
                    updatedStages[a.id] = [...fired, 5];
                    toShow.push(a);
                } else if (diffMinutes <= 15 && diffMinutes > 5 && !fired.includes(15)) {
                    updatedStages[a.id] = [...fired, 15];
                    toShow.push(a);
                }
            });

            if (toShow.length > 0) {
                localStorage.setItem(
                    "appointmentReminderStages",
                    JSON.stringify(updatedStages)
                );
                setVisibleAppointments(toShow);
            }
        };

        // 🔥 TEST MODE: every 5 seconds
        const interval = setInterval(checkReminders, TEST_MODE ? 5000 : 30000);

        checkReminders();

        return () => clearInterval(interval);
    }, [appointmentReminders]);




    if (visibleAppointments.length === 0) return null;

    const formatDateTime = (a: any) => {
        const apptDate = a.time
            ? new Date(`${a.date}T${a.time}`)
            : new Date(a.date);

        const pad = (n: number) => n.toString().padStart(2, "0");

        const displayDate = `${pad(apptDate.getDate())}/${pad(
            apptDate.getMonth() + 1
        )}/${apptDate.getFullYear()}`;

        const displayTime = apptDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        return { displayDate, displayTime };
    };





    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl relative">

                <button
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 transition"
                    onClick={() => setVisibleAppointments([])}
                >
                    ×
                </button>

                <h2 className="text-md font-bold text-gray-800 mb-4 border-b pb-2 uppercase">
                    Upcoming Appointments (within 15 minutes)
                </h2>

                <ul className="space-y-3">
                    {visibleAppointments.map(a => {
                        const { displayDate, displayTime } = formatDateTime(a);

                        return (
                            <li key={a.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                                <div className="font-bold text-md">{a.title}</div>

                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Date:</span> {displayDate}
                                    <span className="ml-2 font-semibold">Time:</span> {displayTime}
                                </div>

                                <div className="text-xs text-gray-700 mt-1">
                                    <span className="font-semibold">Client:</span>{" "}
                                    {clients.find(c => c.id === a.clientId)?.name || "—"}
                                </div>

                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Assigned To:</span>{" "}
                                    {teamMembers.find(t => t.id === a.assignedTo)?.name || "—"}
                                </div>

                                {/* {a.description && (
                                    <div className="text-xs text-gray-700 mt-1">
                                        <span className="font-semibold">Notes:</span> {a.description}
                                    </div>
                                )} */}

                                {a.description && (
                                    <div className="text-xs text-gray-700 mt-1">
                                        <span className="font-semibold">Notes:</span>
                                        <div
                                            className="mt-1 prose prose-sm max-w-none break-words overflow-hidden prose-a:text-blue-600 prose-a:underline prose-a:break-all"
                                            dangerouslySetInnerHTML={{ __html: a.description }}
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};



