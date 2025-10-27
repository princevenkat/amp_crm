import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to hydrate security questions
const getSecurityQuestions = async (entryId) => {
    const [questions] = await db.query('SELECT id, question FROM password_security_questions WHERE entryId = ?', [entryId]);
    // In a real high-security app, answers would be encrypted and only revealed on-demand.
    // For this app's logic, we will mark them as "set".
    return questions.map(q => ({ ...q, answer: 'set' }));
};

// Get password entries
router.get('/', protect, async (req, res) => {
    const { id, role } = req.user;

    try {
        let query = 'SELECT * FROM password_entries';
        const params = [];

        // if (role !== 'Admin' && role !== 'Super Admin') {
        //     query += ' WHERE ownerId = ?';
        //     params.push(id);
        // }

        const FULL_ACCESS_ROLES = ['Admin', 'Super Admin', 'Adviser'];

        if (!FULL_ACCESS_ROLES.includes(role)) {
            query += ' WHERE ownerId = ?';
            params.push(id);
        }

        const [entries] = await db.query(query, params);

        const sanitizedEntries = await Promise.all(entries.map(async (entry) => {
            const securityQuestions = await getSecurityQuestions(entry.id);
            return {
                id: entry.id,
                ownerId: entry.ownerId,
                service: entry.service,
                accessLink: entry.accessLink,
                username: entry.username,
                password: entry.password ? 'set' : '',
                memorablePhrase: entry.memorablePhrase ? 'set' : '',
                securityQuestions,
            };
        }));

        res.json(sanitizedEntries);
    } catch (error) {
        console.error("Failed to get passwords:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new password entry
router.post('/', protect, async (req, res) => {
    const { ownerId, service, accessLink, username, password, memorablePhrase, securityQuestions } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const newEntry = {
            id: `pwd-${uuidv4()}`,
            ownerId, service, accessLink, username, password, memorablePhrase
        };

        await connection.query(
            'INSERT INTO password_entries (id, ownerId, service, accessLink, username, password, memorablePhrase) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newEntry.id, newEntry.ownerId, newEntry.service, newEntry.accessLink, newEntry.username, newEntry.password, newEntry.memorablePhrase]
        );

        if (securityQuestions && securityQuestions.length > 0) {
            for (const sq of securityQuestions) {
                await connection.query(
                    'INSERT INTO password_security_questions (id, entryId, question, answer) VALUES (?, ?, ?, ?)',
                    [`sq-${uuidv4()}`, newEntry.id, sq.question, sq.answer]
                );
            }
        }

        await connection.commit();
        const [createdEntry] = await db.query('SELECT * FROM password_entries WHERE id = ?', [newEntry.id]);
        res.status(201).json(createdEntry[0]);
    } catch (error) {
        await connection.rollback();
        console.error("Failed to create password entry:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        connection.release();
    }
});

// Update a password entry
router.put('/:id', protect, async (req, res) => {
    // This would be a complex transactional update in a real app.
    // Simplified for this context.
    const { id } = req.params;
    const { service, accessLink, username, password, memorablePhrase } = req.body;

    try {
        await db.query(
            'UPDATE password_entries SET service = ?, accessLink = ?, username = ?, password = ?, memorablePhrase = ? WHERE id = ?',
            [service, accessLink, username, password, memorablePhrase, id]
        );
        const [updatedEntry] = await db.query('SELECT * FROM password_entries WHERE id = ?', [id]);
        res.json(updatedEntry[0]);
    } catch (error) {
        console.error("Failed to update password entry:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a password entry
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM password_security_questions WHERE entryId = ?', [id]);
        const [result] = await db.query('DELETE FROM password_entries WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Password entry not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Failed to delete password entry:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;