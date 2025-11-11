import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ================== GET ALL LEDGER ENTRIES ==================
router.get('/', protect, async (req, res) => {
    const { id, role } = req.user;
    const { ownerId, clientId } = req.query;

    try {
        const FULL_ACCESS_ROLES = ['Admin', 'Super Admin'];
        let query = 'SELECT * FROM ledger_entries WHERE 1=1';
        const params = [];

        if (clientId) {
            query += ' AND clientId = ?';
            params.push(clientId);
        }

        if (FULL_ACCESS_ROLES.includes(role)) {
            if (ownerId) {
                query += ' AND ownerId = ?';
                params.push(ownerId);
            }
        } else {
            query += ' AND ownerId = ?';
            params.push(id);
        }

        query += ' ORDER BY date DESC';
        const [entries] = await db.query(query, params);
        res.json(entries);
    } catch (error) {
        console.error('Failed to get ledger entries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// // ================== GET ALL LEDGER ENTRIES ==================
// router.get('/', protect, async (req, res) => {
//     const { id, role } = req.user;

//     try {
//         const FULL_ACCESS_ROLES = ['Admin', 'Super Admin'];
//         let query = 'SELECT * FROM ledger_entries';
//         const params = [];

//         // 🟢 Admin/Super Admin: can view all or filter by ownerId
//         if (FULL_ACCESS_ROLES.includes(role)) {
//             if (req.query.ownerId) {
//                 query += ' WHERE ownerId = ?';
//                 params.push(req.query.ownerId);
//             }
//         }
//         // 🟠 Adviser: only view own entries
//         else {
//             query += ' WHERE ownerId = ?';
//             params.push(id);
//         }

//         query += ' ORDER BY date DESC';
//         const [entries] = await db.query(query, params);
//         res.json(entries);
//     } catch (error) {
//         console.error("Failed to get ledger entries:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// Create a new ledger entry
router.post('/', protect, async (req, res) => {
    const { date, clientName, description, amount, type, ownerId, pay_status } = req.body;
    const newEntry = {
        id: `led-${uuidv4()}`,
        date,
        clientName,
        description,
        amount,
        type,
        pay_status: pay_status || 'Due',
        ownerId: ownerId || req.user.id // Default to the logged-in user
    };

    try {
        await db.query(
            'INSERT INTO ledger_entries (id, date, clientName, description, amount, type, pay_status, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newEntry.id, newEntry.date, newEntry.clientName, newEntry.description, newEntry.amount, newEntry.type, newEntry.pay_status, newEntry.ownerId]
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
    const { date, clientName, description, amount, type, pay_status } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE ledger_entries SET date = ?, clientName = ?, description = ?, amount = ?, type = ?, pay_status = ? WHERE id = ?',
            [date, clientName, description, amount, type, pay_status, id]
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