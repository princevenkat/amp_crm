import React, { useState, useEffect, useMemo, useRef } from "react";
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

    // useEffect(() => {
    //     if (!appointment) return;

    //     const dt = appointment.date ? new Date(appointment.date) : null;

    //     setForm({
    //         clientId: appointment.clientId || "",
    //         title: appointment.title || "",
    //         description: appointment.description || "",
    //         date: dt ? dt.toISOString().split("T")[0] : "",
    //         time: dt ? dt.toTimeString().slice(0, 5) : "",
    //         endTime: appointment.endTime
    //             ? appointment.endTime.slice(0, 5) // HH:mm:ss → HH:mm
    //             : "",
    //         location: appointment.location || "",
    //         assignedTo: appointment.assignedTo || "",
    //         status: appointment.status || "Scheduled",
    //     });
    // }, [appointment]);

    useEffect(() => {
        if (!appointment?.date) return;

        const dt = new Date(appointment.date);

        const pad = (n: number) => n.toString().padStart(2, "0");

        setForm({
            clientId: appointment.clientId || "",
            title: appointment.title || "",
            description: appointment.description || "",
            date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
            time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
            endTime: appointment.endTime?.slice(0, 5) || "",
            location: appointment.location || "",
            assignedTo: appointment.assignedTo || "",
            status: appointment.status || "Scheduled",
        });
    }, [appointment]);



    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };


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

            // if (appointment && onUpdate) {
            //     await onUpdate(appointment.id, payload);
            // } else {
            //     await onSave(payload as Omit<Appointment, "id">);
            // }

            const isEditing =
                typeof appointment?.id === "string" &&
                appointment.id.trim().length > 0 &&
                typeof onUpdate === "function";

            if (isEditing) {
                await onUpdate!(appointment!.id, payload);
            } else {
                await onSave(payload as Omit<Appointment, "id">);
            }

            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to save appointment.");
        }
    };




    const editor = useRef(null);

    const joditConfig = useMemo(
        () => ({
            readonly: false,
            height: 120,
            toolbarAdaptive: true,   // ✅ IMPORTANT
            toolbarSticky: false,
            // toolbarButtonSize: "small",
            placeholder: "",
            showCharsCounter: false,
            showWordsCounter: false,
            // showXPathInStatusbar: false,
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



        }),
        []
    );


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
                    ref={editor}
                    value={form.description}
                    config={joditConfig}
                    onBlur={(newContent) =>
                        setForm(prev => ({ ...prev, description: newContent }))
                    }
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
