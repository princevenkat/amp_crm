import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Helper: convert JS Date to MySQL DATETIME string ---
function toMySQLDatetime(date) {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');

    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1); // months are 0-indexed
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// --- GET all appointments ---
router.get("/", protect, async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM appointments");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- POST create appointment ---
router.post("/", protect, async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            location,
            clientId,
            assignedTo,
            status,
            reminder,
        } = req.body;

        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required." });
        }

        const appointmentDate = time
            ? toMySQLDatetime(new Date(`${date}T${time}`))
            : toMySQLDatetime(new Date(date));

        const id = uuidv4();
        const createdBy = req.user.id;

        const finalStatus = ['Scheduled', 'Completed', 'Cancelled'].includes(status)
            ? status
            : "Scheduled";

        await db.execute(
            `INSERT INTO appointments
        (id, title, description, date, location, clientId, createdBy, assignedTo, status, reminder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                title,
                description || null,
                appointmentDate,
                location || null,
                clientId || null,
                createdBy,
                assignedTo || null,
                finalStatus,
                reminder === undefined ? true : reminder,
            ]
        );

        res.status(201).json({ id, ...req.body, createdBy });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- PUT update appointment ---
router.put("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Map frontend field to DB
        if (updates.assignedTo) {
            updates.assignedTo = updates.assignedTo;
            delete updates.assignedTo;
        }

        // Combine date + time for DB
        if (updates.date) {
            const dt = updates.time
                ? new Date(`${updates.date}T${updates.time}`)
                : new Date(updates.date);

            updates.date = toMySQLDatetime(dt);
            delete updates.time;
        }

        // Validate status
        if (updates.status) {
            const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
            if (!validStatuses.includes(updates.status)) {
                updates.status = "Scheduled";
            }
        }

        // Build query dynamically
        const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updates);

        await db.execute(`UPDATE appointments SET ${fields} WHERE id = ?`, [...values, id]);

        res.json({ message: "Appointment updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- DELETE appointment ---
router.delete("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM appointments WHERE id = ?", [id]);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
