import React, { useState } from "react";
import { duplicateClient } from "../services/apiService"; // your API helper

interface Props {
    clientId: string;
    onDuplicate?: (newClientId: string) => void; // optional callback after duplication
}

const DuplicateButton: React.FC<Props> = ({ clientId, onDuplicate }) => {
    const [duplicating, setDuplicating] = useState(false);

    const handleDuplicate = async () => {
        if (!window.confirm("Are you sure you want to duplicate this client?")) return;

        try {
            setDuplicating(true);
            const result = await duplicateClient(clientId);
            alert(`Client duplicated! New client ID: ${result.newClientId}`);

            if (onDuplicate) {
                onDuplicate(result.newClientId);
            }
        } catch (error: any) {
            console.error("Duplicate failed:", error);
            alert(`Failed to duplicate client: ${error.message || "Unknown error"}`);
        } finally {
            setDuplicating(false);
        }
    };

    return (
        <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
            {duplicating ? "Duplicating..." : "Duplicate Client"}
        </button>
    );
};

export default DuplicateButton;
