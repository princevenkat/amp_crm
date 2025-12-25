import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../contexts/DataContext";
import { AppointmentForm } from "../components/AppointmentForm";
import { Appointment } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { DeleteIcon, EditIcon } from "@/components/ui/Icons";

export const AppointmentsView: React.FC = () => {
    const {
        appointments,
        deleteAppointment,
        clients,
        teamMembers,
        addAppointment,
        updateAppointment,
    } = useContext(DataContext);

    const [openForm, setOpenForm] = useState(false);
    const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [filterClient, setFilterClient] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterAssigned, setFilterAssigned] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const handleEdit = (id: string) => {
        setEditAppointmentId(id);
        setOpenForm(true);
    };

    const handleNew = () => {
        setEditAppointmentId(null);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditAppointmentId(null);
    };

    const editingAppointment = appointments.find(a => a.id === editAppointmentId);

    // const saveAppointmentWrapper = async (data: Omit<Appointment, "id">, id?: string) => {
    //     if (id) await updateAppointment(id, data);
    //     else await addAppointment(data);
    // };

    // const saveAppointmentWrapper = async (data: Omit<Appointment, "id">, id?: string) => {
    //     try {
    //         if (id) {
    //             await updateAppointment(id, data); // context function
    //         } else {
    //             await addAppointment(data); // context function
    //         }

    //         // Close modal
    //         setEditAppointmentId(null);
    //         setOpenForm(false);

    //         // No need to call setAppointments here
    //         // DataContext already updated appointments, table will rerender
    //     } catch (error) {
    //         console.error("Failed to save appointment:", error);
    //         alert("Failed to save appointment. See console for details.");
    //     }
    // };

    const saveAppointmentWrapper = async (
        data: Omit<Appointment, "id"> | Partial<Appointment>,
        id?: string
    ) => {
        try {
            if (id) {
                // UPDATE → Partial is allowed
                await updateAppointment(id, data as Partial<Appointment>);
            } else {
                // CREATE → Full data required
                await addAppointment(data as Omit<Appointment, "id">);
            }

            setEditAppointmentId(null);
            setOpenForm(false);
        } catch (error) {
            console.error("Failed to save appointment:", error);
            alert("Failed to save appointment. See console for details.");
        }
    };

    // console.log(saveAppointmentWrapper);

    // ───────────────────────────────────────────────────────────────
    // FILTER LOGIC
    // ───────────────────────────────────────────────────────────────
    // const filteredAppointments = useMemo(() => {
    //     return appointments.filter(a => {
    //         const matchSearch =
    //             a.title.toLowerCase().includes(search.toLowerCase()) ||
    //             (a.description || "").toLowerCase().includes(search.toLowerCase());

    //         const matchClient = filterClient ? a.clientId === filterClient : true;
    //         const matchStatus = filterStatus ? a.status === filterStatus : true;
    //         const matchAssigned = filterAssigned ? a.assignedTo === filterAssigned : true;
    //         const matchDate = filterDate ? a.date.startsWith(filterDate) : true;

    //         return matchSearch && matchClient && matchStatus && matchAssigned && matchDate;
    //     });
    // }, [appointments, search, filterClient, filterStatus, filterAssigned, filterDate]);

    type SortKey = "title" | "client" | "assigned" | "date" | "status";

    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };
    const filteredAppointments = useMemo(() => {
        const filtered = appointments.filter(a => {
            const title = (a.title ?? "").toLowerCase();
            const description = (a.description ?? "").toLowerCase();
            const searchText = search.toLowerCase();

            const matchSearch = title.includes(searchText) || description.includes(searchText);
            const matchClient = filterClient ? a.clientId === filterClient : true;
            const matchStatus = filterStatus ? a.status === filterStatus : true;
            const matchAssigned = filterAssigned ? a.assignedTo === filterAssigned : true;
            const matchDate = filterDate ? (a.date ?? "").slice(0, 10) === filterDate : true;

            return matchSearch && matchClient && matchStatus && matchAssigned && matchDate;
        });

        return filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortKey) {
                case "title":
                    aVal = a.title ?? "";
                    bVal = b.title ?? "";
                    break;

                case "client":
                    aVal = clients.find(c => c.id === a.clientId)?.name ?? "";
                    bVal = clients.find(c => c.id === b.clientId)?.name ?? "";
                    break;

                case "assigned":
                    aVal = teamMembers.find(t => t.id === a.assignedTo)?.name ?? "";
                    bVal = teamMembers.find(t => t.id === b.assignedTo)?.name ?? "";
                    break;

                case "date":
                    aVal = a.date ? new Date(a.date).getTime() : 0;
                    bVal = b.date ? new Date(b.date).getTime() : 0;
                    break;

                case "status":
                    aVal = a.status ?? "";
                    bVal = b.status ?? "";
                    break;
            }

            if (typeof aVal === "string") {
                return sortOrder === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        });
    }, [
        appointments,
        clients,
        teamMembers,
        search,
        filterClient,
        filterStatus,
        filterAssigned,
        filterDate,
        sortKey,
        sortOrder,
    ]);


    // const filteredAppointments = appointments.filter(a => {
    //     const title = (a.title ?? "").toLowerCase();
    //     const description = (a.description ?? "").toLowerCase();
    //     const searchText = search.toLowerCase();

    //     const matchSearch = title.includes(searchText) || description.includes(searchText);
    //     const matchClient = filterClient ? a.clientId === filterClient : true;
    //     const matchStatus = filterStatus ? a.status === filterStatus : true;
    //     const matchAssigned = filterAssigned ? a.assignedTo === filterAssigned : true;
    //     const matchDate = filterDate ? (a.date ?? "").slice(0, 10) === filterDate : true;

    //     return matchSearch && matchClient && matchStatus && matchAssigned && matchDate;
    // });



    // console.log("Appointments changed:", appointments);

    const SortTh = ({
        label,
        column,
    }: {
        label: string;
        column: SortKey;
    }) => (
        <th
            onClick={() => handleSort(column)}
            className="p-2 border cursor-pointer select-none hover:bg-gray-200"
        >
            <span className="flex items-center gap-1">
                {label}
                {sortKey === column && (
                    <span className="text-xs">
                        {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                )}
            </span>
        </th>
    );
    return (
        <div className="p-4 sm:p-8">

            {/* ───────────────────────────────────────────────────────── */}
            {/* NEW BUTTON */}
            {/* ───────────────────────────────────────────────────────── */}
            <button
                onClick={handleNew}
                className="mb-4 flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors ms-auto"
            >
                + New Appointment
            </button>

            {/* ───────────────────────────────────────────────────────── */}
            {/* FILTER BAR */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 text-sm">

                <input
                    placeholder="Search title or description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Search by client</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    value={filterAssigned}
                    onChange={(e) => setFilterAssigned(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Assigned To</option>
                    {teamMembers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* APPOINTMENTS TABLE */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="overflow-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 border">
                            <SortTh label="Event" column="title" />
                            <SortTh label="Client" column="client" />
                            <SortTh label="Assigned To" column="assigned" />
                            <SortTh label="Date" column="date" />
                            <SortTh label="Status" column="status" />
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAppointments.length > 0
                            ? filteredAppointments.map((a, index) => (
                                <tr
                                    key={a.id ?? `appointment-${index}`}
                                    className="border hover:bg-gray-50"
                                >
                                    <td className="p-2 border font-medium">{a.title}</td>

                                    <td className="p-2 border">
                                        {clients.find((c) => c.id === a.clientId)?.name || "—"}
                                    </td>

                                    <td className="p-2 border">
                                        {teamMembers.find((t) => t.id === a.assignedTo)?.name || "—"}
                                    </td>

                                    <td className="p-2 border">
                                        {/* {a.date
                                            ? new Date(a.date).toLocaleString([], {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "—"} */}
                                        {a.date
                                            ? (() => {
                                                const dt = new Date(a.date);
                                                const formattedDate = dt.toLocaleDateString('en-GB'); // DD/MM/YYYY
                                                const formattedTime = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                return `${formattedDate} ${formattedTime}`;
                                            })()
                                            : "—"}
                                    </td>

                                    <td className="p-2 border">{a.status}</td>

                                    <td className=" px-6 py-2 flex gap-5 justify-center">
                                        <button
                                            onClick={() => handleEdit(a.id)}
                                            className="text-sm font-semibold text-blue-900 mr-4"
                                        >
                                            {EditIcon}
                                        </button>
                                        <button
                                            onClick={() => deleteAppointment(a.id)}
                                            className="text-sm font-semibold text-red-500"
                                        >
                                            {DeleteIcon}
                                        </button>
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr key="no-appointments">
                                    <td colSpan={6} className="text-center p-4 text-gray-500">
                                        No appointments found.
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>

                </table>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* FORM MODAL */}
            {/* ───────────────────────────────────────────────────────── */}
            <Modal
                title={editingAppointment ? "Edit Appointment" : "New Appointment"}
                isOpen={openForm}
                onClose={handleCloseForm}
            >
                <AppointmentForm
                    appointment={editingAppointment}
                    clients={clients}
                    teamMembers={teamMembers}
                    onClose={handleCloseForm}
                    onSave={(data) => saveAppointmentWrapper(data, editingAppointment?.id)}
                    onUpdate={(id, data) => saveAppointmentWrapper(data, id)}
                />
            </Modal>
        </div>
    );
};
