import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all ledger entries
router.get('/', protect, async (req, res) => {
    try {
        const [entries] = await db.query('SELECT * FROM ledger_entries ORDER BY date DESC');
        res.json(entries);
    } catch (error) {
        console.error("Failed to get ledger entries:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new ledger entry
router.post('/', protect, async (req, res) => {
    const { date, clientName, description, amount, type } = req.body;
    const newEntry = {
        id: `led-${uuidv4()}`,
        date, clientName, description, amount, type
    };

    try {
        await db.query(
            'INSERT INTO ledger_entries (id, date, clientName, description, amount, type) VALUES (?, ?, ?, ?, ?, ?)',
            [newEntry.id, newEntry.date, newEntry.clientName, newEntry.description, newEntry.amount, newEntry.type]
        );
        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Failed to create ledger entry:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a ledger entry
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { date, clientName, description, amount, type } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE ledger_entries SET date = ?, clientName = ?, description = ?, amount = ?, type = ? WHERE id = ?',
            [date, clientName, description, amount, type, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ledger entry not found' });
        }
        const [updatedEntry] = await db.query('SELECT * FROM ledger_entries WHERE id = ?', [id]);
        res.json(updatedEntry[0]);
    } catch (error) {
        console.error("Failed to update ledger entry:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a ledger entry
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM ledger_entries WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ledger entry not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Failed to delete ledger entry:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;