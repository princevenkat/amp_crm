import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();



// 🟩 GET all contacts (role-based)
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query, params;

        if (userRole === 'Admin' || userRole === 'Super Admin') {
            // Admin: see all contacts
            query = 'SELECT * FROM contacts ORDER BY name ASC';
            params = [];
        } else if (userRole === 'Adviser') {
            // Advisor: see only their own contacts
            query = 'SELECT * FROM contacts WHERE createdBy = ? ORDER BY name ASC';
            params = [userId];
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        const [contacts] = await db.query(query, params);
        res.json(contacts);
    } catch (error) {
        console.error("Failed to get contacts:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🟦 Create a new contact
router.post('/', protect, async (req, res) => {
    const { name, type, email, phone, company, address } = req.body;
    const userId = req.user.id;

    const newContact = {
        id: `con-${uuidv4()}`,
        name,
        type,
        email,
        phone,
        company,
        address,
        createdBy: userId
    };

    try {
        await db.query(
            'INSERT INTO contacts (id, name, type, email, phone, company, address, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newContact.id, newContact.name, newContact.type, newContact.email, newContact.phone, newContact.company, newContact.address, newContact.createdBy]
        );
        res.status(201).json(newContact);
    } catch (error) {
        console.error("Failed to create contact:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🟨 Update a contact (only if user owns it or is admin)
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { name, type, email, phone, company, address } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Check ownership unless admin
        if (userRole !== 'Admin' || userRole !== 'Super Admin') {
            const [rows] = await db.query('SELECT createdBy FROM contacts WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Contact not found' });
            if (rows[0].createdBy !== userId) {
                return res.status(403).json({ message: 'Not authorized to edit this contact' });
            }
        }

        const [result] = await db.query(
            'UPDATE contacts SET name = ?, type = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?',
            [name, type, email, phone, company, address, id]
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

// // 🟥 Delete a contact (only if user owns it or is admin)
// router.delete('/:id', protect, async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     try {
//         if (userRole !== 'Admin' || userRole !== 'Super Admin') {
//             const [rows] = await db.query('SELECT createdBy FROM contacts WHERE id = ?', [id]);
//             if (rows.length === 0) return res.status(404).json({ message: 'Contact not found' });
//             if (rows[0].createdBy !== userId) {
//                 return res.status(403).json({ message: 'Not authorized to delete this contact' });
//             }
//         }

//         const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'Contact not found' });
//         }
//         res.status(204).send();
//     } catch (error) {
//         console.error("Failed to delete contact:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// 🟥 Delete a contact (only if user owns it or is admin)
// router.delete('/:id', protect, async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     try {
//         // ✅ Only non-admin users need ownership check
//         if (userRole !== 'Admin' && userRole !== 'Super Admin') {
//             const [rows] = await db.query('SELECT createdBy FROM contacts WHERE id = ?', [id]);
//             if (rows.length === 0) {
//                 return res.status(404).json({ message: 'Contact not found' });
//             }
//             if (rows[0].createdBy !== userId) {
//                 return res.status(403).json({ message: 'Not authorized to delete this contact' });
//             }
//         }

//         // ✅ Delete contact
//         const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'Contact not found' });
//         }

//         res.status(204).send(); // No content on success
//     } catch (error) {
//         console.error("Failed to delete contact:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// 🟥 Delete a contact (only if user owns it or is admin/super admin)
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // 🟨 Only non-admin users need to own the contact
        if (userRole !== 'Admin' && userRole !== 'Super Admin') {
            const [rows] = await db.query('SELECT createdBy FROM contacts WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Contact not found' });
            }

            // 🟩 Advisor or other user can only delete their own
            if (rows[0].createdBy !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this contact' });
            }
        }

        // 🟥 Perform the deletion
        const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(204).send(); // No content response on success
    } catch (error) {
        console.error("Failed to delete contact:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// ✅ Add optional ?type=Solicitor query support
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { type } = req.query;

        let query = '';
        let params = [];

        if (userRole === 'Admin' || userRole === 'Super Admin') {
            query = 'SELECT * FROM contacts';
            if (type) {
                query += ' WHERE type = ?';
                params.push(type);
            }
            query += ' ORDER BY name ASC';
        } else if (userRole === 'Adviser') {
            query = 'SELECT * FROM contacts WHERE createdBy = ?';
            params.push(userId);
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            query += ' ORDER BY name ASC';
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        const [contacts] = await db.query(query, params);
        res.json(contacts);
    } catch (error) {
        console.error("Failed to get contacts:", error);
        res.status(500).json({ message: "Server error" });
    }
});





export default router;