import React, { useState, useEffect } from "react";
import type { Appointment, Client, TeamMember } from "../types";

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
        location: "",
        assignedTo: "",
        status: "Scheduled",
    });

    // Fill form if editing
    useEffect(() => {
        if (appointment) {
            // Parse backend date into separate date + time for inputs
            const dt = appointment.date ? new Date(appointment.date) : null;
            const dateStr = dt ? dt.toISOString().split("T")[0] : "";
            const timeStr = dt ? dt.toTimeString().slice(0, 5) : ""; // HH:MM

            setForm({
                clientId: appointment.clientId || "",
                title: appointment.title || "",
                description: appointment.description || "",
                date: dateStr,
                time: timeStr,
                location: appointment.location || "",
                assignedTo: appointment.assignedTo || "", // map backend assignedTo
                status: appointment.status || "Scheduled",
            });
        }
    }, [appointment]);


    // Default client/teamMember if creating
    useEffect(() => {
        if (!appointment && clients.length > 0 && teamMembers.length > 0) {
            setForm(prev => ({
                ...prev,
                clientId: prev.clientId || clients[0].id,
                assignedTo: prev.assignedTo || teamMembers[0].id,
            }));
        }
    }, [appointment, clients, teamMembers]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.clientId || !form.title || !form.date) {
            alert("Client, title, and date are required.");
            return;
        }

        try {
            const combinedDate = form.time
                ? new Date(`${form.date}T${form.time}`).toISOString()
                : new Date(form.date).toISOString();

            const payload: Partial<Appointment> = {
                ...form,
                date: combinedDate,
            };

            delete payload.time;

            if (appointment && onUpdate) {
                await onUpdate(appointment.id, payload);
            } else {
                await onSave(payload);
            }

            onClose();
        } catch (error) {
            console.error("Failed to save appointment:", error);
            alert("Failed to save appointment. See console for details.");
        }
    };



    return (

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Client */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Client</label>
                <select
                    name="clientId"
                    value={form.clientId}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                    required
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
                <label className="block font-medium text-text-secondary mb-1">Title</label>
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
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                />
            </div>

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

            {/* Time */}
            <div>
                <label className="block font-medium text-text-secondary mb-1">Time</label>
                <input
                    type="time"
                    name="time"
                    value={form.time || ""}
                    onChange={handleChange}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                />
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
