import React, { useContext } from "react";
import { DataContext } from "../contexts/DataContext";

export const AppointmentReminderPopup: React.FC = () => {
    const {
        appointmentReminders,
        appointmentPopupOpen,
        closeAppointmentPopup,
        clients,
        teamMembers,
    } = useContext(DataContext);

    const now = new Date();

    // 🔥 Filter only appointments within next 15 minutes
    const upcomingWithin15Min = appointmentReminders.filter((a: any) => {
        const apptDate = a.time
            ? new Date(`${a.date}T${a.time}`)
            : new Date(a.date);

        const diffInMs = apptDate.getTime() - now.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);

        return diffInMinutes > 0 && diffInMinutes <= 15;
    });

    if (!appointmentPopupOpen || upcomingWithin15Min.length === 0) return null;

    // const formatDateTime = (a: any) => {
    //     const apptDate = a.time
    //         ? new Date(`${a.date}T${a.time}`)
    //         : new Date(a.date);

    //     return {
    //         displayDate: apptDate.toLocaleDateString(),
    //         displayTime: apptDate.toLocaleTimeString([], {
    //             hour: "2-digit",
    //             minute: "2-digit",
    //         }),
    //     };
    // };

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
                    onClick={closeAppointmentPopup}
                >
                    ×
                </button>

                <h2 className="text-md font-bold text-gray-800 mb-4 border-b pb-2 uppercase">
                    Upcoming Appointments (within 15 minutes)
                </h2>

                <ul className="space-y-3">
                    {upcomingWithin15Min.map(a => {
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
                                            className="mt-1 prose prose-sm max-w-none"
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




// import React, { useContext } from "react";
// import { DataContext } from "../contexts/DataContext";

// export const AppointmentReminderPopup: React.FC = () => {
//     const {
//         appointmentReminders,
//         appointmentPopupOpen,
//         closeAppointmentPopup,
//         clients,
//         teamMembers,
//     } = useContext(DataContext);

//     if (!appointmentPopupOpen || appointmentReminders.length === 0) return null;

//     const formatDateTime = (a: any) => {
//         const apptDate = a.time ? new Date(`${a.date}T${a.time}`) : new Date(a.date);
//         const displayDate = apptDate.toLocaleDateString();
//         const displayTime = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         return { displayDate, displayTime };
//     };

//     // console.log(appointmentReminders);

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl relative">

//                 {/* Close Button */}
//                 <button
//                     className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 transition"
//                     onClick={closeAppointmentPopup}
//                 >
//                     ×
//                 </button>

//                 <h2 className="text-md font-bold text-gray-800 mb-4 border-b pb-2 uppercase">
//                     Upcoming Appointments (within 15 minutes)
//                 </h2>

//                 <ul className="space-y-3">
//                     {appointmentReminders.map(a => {
//                         const { displayDate, displayTime } = formatDateTime(a);
//                         return (
//                             <li key={a.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
//                                 <div className="font-bold text-md">{a.title}</div>

//                                 <div className="text-xs text-gray-700">
//                                     <span className="font-semibold">Date:</span> {displayDate}
//                                     <span className="ml-2 font-semibold">Time:</span> {displayTime}
//                                 </div>

//                                 <div className="text-xs text-gray-700 mt-1">
//                                     <span className="font-semibold">Client:</span>{" "}
//                                     {clients.find(c => c.id === a.clientId)?.name || "—"}
//                                 </div>

//                                 <div className="text-xs text-gray-700">
//                                     <span className="font-semibold">Assigned To:</span>{" "}
//                                     {teamMembers.find(t => t.id === a.assignedTo)?.name || "—"}
//                                 </div>

//                                 {a.description && (
//                                     <div className="text-xs text-gray-700 mt-1">
//                                         <span className="font-semibold">Notes:</span> {a.description}
//                                     </div>
//                                 )}
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </div>
//         </div>
//     );
// };
