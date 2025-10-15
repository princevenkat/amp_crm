import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all contacts
router.get('/', protect, async (req, res) => {
    try {
        const [contacts] = await db.query('SELECT * FROM contacts ORDER BY name ASC');
        res.json(contacts);
    } catch (error) {
        console.error("Failed to get contacts:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new contact
router.post('/', protect, async (req, res) => {
    const { name, type, email, phone, company } = req.body;
    const newContact = {
        id: `con-${uuidv4()}`,
        name, type, email, phone, company
    };

    try {
        await db.query(
            'INSERT INTO contacts (id, name, type, email, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
            [newContact.id, newContact.name, newContact.type, newContact.email, newContact.phone, newContact.company]
        );
        res.status(201).json(newContact);
    } catch (error) {
        console.error("Failed to create contact:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a contact
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { name, type, email, phone, company } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE contacts SET name = ?, type = ?, email = ?, phone = ?, company = ? WHERE id = ?',
            [name, type, email, phone, company, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        const [updatedContactRows] = await db.query('SELECT * FROM contacts WHERE id = ?', [id]);
        res.json(updatedContactRows[0]);
    } catch (error) {
        console.error("Failed to update contact:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a contact
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Failed to delete contact:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;