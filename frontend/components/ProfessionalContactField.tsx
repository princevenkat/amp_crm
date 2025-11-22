import React, { useContext } from "react";
import { DataContext } from "../contexts/DataContext";

interface Contact {
    id: string | number;
    name: string;
    company?: string;
    address?: string;
    email?: string;
    phone?: string;
}

interface ProfessionalContactFieldProps {
    label: string;
    contact?: Contact;
    contacts: Contact[];
    isEditing: boolean;
    onChange: (field: string, value: any) => void;
}

const ProfessionalContactField: React.FC<ProfessionalContactFieldProps> = ({
    label,
    contact,
    contacts,
    isEditing,
    onChange,
}) => {
    const selected = contacts.find(c => c.id === contact?.id);

    // 🟦 modal functions from context
    const { openContactModal } = useContext(DataContext);

    return (
        <div className="border p-4 rounded-md mb-4 relative">
            <div className="block ">
                <h5 className="font-bold mb-2 flex justify-between w-100 items-center">{label}

                    {isEditing && (
                        <>
                            {selected && (
                                <a
                                    onClick={() => openContactModal(selected)} // open with data
                                    class="px-2 py-0 uppercase text-[11px] font-bold text-gray-700 rounded-full
                bg-white shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.12)]
                hover:bg-gray-50 active:scale-95 transition
                border border-gray-200 inline-flex items-center gap-1 cursor-pointer"
                                >
                                    ✏️ Edit
                                </a>
                            )}
                            {!selected ? (
                                <button
                                    type="button"
                                    onClick={() => openContactModal()} // open empty form
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded-md"
                                >
                                    + Add
                                </button>
                            ) : (<></>)}
                        </>
                    )}

                </h5>

                {/* Add New / Edit Buttons */}
                {/* {isEditing && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => openContactModal()} // open empty form
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded-md"
                        >
                            + Add
                        </button>

                        {selected && (
                            <button
                                type="button"
                                onClick={() => openContactModal(selected)} // open with data
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                )} */}
            </div>

            {isEditing ? (
                <select
                    value={contact?.id || ""}
                    onChange={(e) => {
                        const sel = contacts.find(s => s.id.toString() === e.target.value);
                        onChange("id", sel?.id || "");
                    }}
                    className="w-full p-2 border rounded-md bg-surface text-text-primary"
                >
                    <option value="">Select {label}...</option>
                    {contacts.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.company ? `${s.company}` : ""}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="py-2 space-y-1 text-xs">
                    {!selected ? (
                        <>
                            <p>Not Assigned</p>

                        </>
                    ) : (
                        <>
                            {/* <p><strong>Name:</strong> {selected.name}</p> */}
                            {selected.company && <p><strong>Company:</strong> {selected.company}</p>}
                            {selected.address && <p><strong>Address:</strong> {selected.address}</p>}
                            {selected.email && <p><strong>Email:</strong> {selected.email}</p>}
                            {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}


                            {/* <button
                                    type="button"
                                    onClick={() => openContactModal()} // open empty form
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded-md"
                                >
                                    + Add
                                </button> */}

                            {/* {selected && (
                                <div className="pt-2">
                                    <a

                                        onClick={() => openContactModal(selected)} // open with data
                                        class="px-2 py-1 uppercase text-xs font-bold text-gray-700 rounded-full
           bg-white shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.12)]
           hover:bg-gray-50 active:scale-95 transition
           border border-gray-200 inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        ✏️ Edit
                                    </a>
                                </div>
                            )} */}

                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfessionalContactField;
