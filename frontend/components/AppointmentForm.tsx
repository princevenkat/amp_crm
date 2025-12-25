import React, { useState, useEffect } from "react";
import type { Appointment, Client, TeamMember } from "../types";
import JoditEditor from "jodit-react";




type Props = {
    appointment?: Appointment;
    clients: Client[];
    teamMembers: TeamMember[];
    onSave: (data: Omit<Appointment, "id">) => Promise<void>;
    onUpdate?: (id: string, data: Partial<Appointment>) => Promise<void>;
    onClose: () => void;
};

export const AppointmentForm: React.FC<Props> = ({
    appointment,
    clients,
    teamMembers,
    onSave,
    onUpdate,
    onClose,
}) => {
    const [form, setForm] = useState<Omit<Appointment, "id">>({
        clientId: "",
        title: "",
        description: "",
        date: "",
        time: "",
        endTime: "",
        location: "",
        assignedTo: "",
        status: "Scheduled",
    });

    useEffect(() => {
        if (!appointment) return;

        const dt = appointment.date ? new Date(appointment.date) : null;

        setForm({
            clientId: appointment.clientId || "",
            title: appointment.title || "",
            description: appointment.description || "",
            date: dt ? dt.toISOString().split("T")[0] : "",
            time: dt ? dt.toTimeString().slice(0, 5) : "",
            endTime: appointment.endTime
                ? appointment.endTime.slice(0, 5) // HH:mm:ss → HH:mm
                : "",
            location: appointment.location || "",
            assignedTo: appointment.assignedTo || "",
            status: appointment.status || "Scheduled",
        });
    }, [appointment]);



    // Default client/teamMember if creating
    // useEffect(() => {
    //     if (!appointment && clients.length > 0 && teamMembers.length > 0) {
    //         setForm(prev => ({
    //             ...prev,
    //             clientId: prev.clientId || clients[0].id,
    //             assignedTo: prev.assignedTo || teamMembers[0].id,
    //         }));
    //     }
    // }, [appointment, clients, teamMembers]);




    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     if (!form.clientId || !form.title || !form.date) {
    //         alert("Client, title, and date are required.");
    //         return;
    //     }

    //     try {
    //         // Combine date + time into single ISO string for DB
    //         const combinedDate = form.time
    //             ? new Date(`${form.date}T${form.time}`).toISOString()
    //             : new Date(form.date).toISOString();

    //         const payload = {
    //             ...form,
    //             date: combinedDate,   // <-- send as "date" for DB
    //         };
    //         delete payload.time;       // remove time field

    //         console.log("Sending appointment payload:", payload);

    //         if (appointment && onUpdate) {
    //             await onUpdate(appointment.id, payload);
    //         } else {
    //             await onSave(payload);
    //         }

    //         onClose();
    //     } catch (error) {
    //         console.error("Failed to save appointment:", error);
    //         alert("Failed to save appointment. See console for details.");
    //     }
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     if (!form.title || !form.date) {
    //         alert("Event, and Date are required.");
    //         return;
    //     }

    //     try {
    //         const combinedDate = form.time
    //             ? new Date(`${form.date}T${form.time}`).toISOString()
    //             : new Date(form.date).toISOString();

    //         const payload: Partial<Appointment> = {
    //             ...form,
    //             date: combinedDate,
    //         };

    //         delete payload.time;

    //         if (appointment && onUpdate) {
    //             await onUpdate(appointment.id, payload);
    //         } else {
    //             await onSave(payload);
    //         }

    //         onClose();
    //     } catch (error) {
    //         console.error("Failed to save appointment:", error);
    //         alert("Failed to save appointment. See console for details.");
    //     }
    // };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.date) {
            alert("Event and Date are required.");
            return;
        }

        try {
            const toMySQLDatetime = (d: Date) => {
                const pad = (n: number) => n.toString().padStart(2, "0");
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const startDate = form.time
                ? new Date(`${form.date}T${form.time}`)
                : new Date(`${form.date}T00:00`);

            const payload: Partial<Appointment> = {
                ...form,
                clientId: form.clientId || undefined,
                assignedTo: form.assignedTo || undefined,
                date: toMySQLDatetime(startDate),
                endTime: form.endTime ? `${form.endTime}:00` : null,
            };

            delete payload.time;

            if (appointment && onUpdate) {
                await onUpdate(appointment.id, payload);
            } else {
                await onSave(payload as Omit<Appointment, "id">);
            }

            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to save appointment.");
        }
    };






    return (

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Client */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Search by client</label>
                <select
                    name="clientId"
                    value={form.clientId}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"

                >
                    <option value="">Select client</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Title */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Event</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Description</label>
                {/* <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                /> */}

                <JoditEditor
                    name="description"
                    value={form.description}
                    onChange={(newContent) =>
                        setForm((prev) => ({ ...prev, description: newContent }))
                    }
                    config={{
                        readonly: false,
                        height: 120,
                        toolbarAdaptive: false,
                        toolbarSticky: false,
                        buttons: [
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "superscript",
                            "subscript",
                            "ul",
                            "ol",
                            "outdent",
                            "indent",
                            "font",
                            "fontsize",
                            "brush",
                            "paragraph",
                            "image",
                            "video",
                            "table",
                            "link",
                            "align",
                            "undo",
                            "redo",
                            "hr",
                            "eraser",
                            "copyformat",
                            "fullsize",
                            "print",
                            "source",
                        ],
                    }}

                />

            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Date */}
                <div>
                    <label className="block font-medium text-text-secondary mb-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>


                {/* Start Time */}
                <div>
                    <label className="block font-medium text-text-secondary mb-1">Start Time</label>
                    <input
                        type="time"
                        name="time"
                        value={form.time || ""}
                        onChange={handleChange}
                        className="w-full bg-surface border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* End Time */}
                <div>
                    <label className="block font-medium text-text-secondary mb-1">End Time</label>
                    <input
                        type="time"
                        name="endTime"
                        value={form.endTime || ""}
                        onChange={handleChange}
                        className="w-full bg-surface border border-gray-300 rounded-md p-2"
                    />
                </div>
            </div>
            {/* Location */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Location</label>
                <input
                    name="location"
                    value={form.location || ""}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                />
            </div>

            {/* Assigned To */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Assigned To</label>
                <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                >
                    <option value="">Select member</option>
                    {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>
                            {tm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">
                    Cancel
                </button>
                <button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">{appointment ? "Update" : "Create"}</button>
            </div>
        </form>


    );
};
