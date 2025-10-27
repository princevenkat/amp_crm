import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../mysql-connector.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all team members (excluding passwords)
router.get('/', protect, async (req, res) => {
    try {
        const [team] = await db.query('SELECT id, name, role, email, avatar FROM team_members');
        res.json(team);
    } catch (error) {
        console.error("Failed to get team members:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new team member
router.post('/', protect, adminOnly, async (req, res) => {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM team_members WHERE email = ?', [email.toLowerCase()]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'A team member with this email already exists' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newMember = {
            id: `team-${uuidv4()}`,
            name,
            email: email.toLowerCase(),
            role,
            password: hashedPassword,
            avatar: `https://picsum.photos/seed/${name.split(' ')[0]}/100/100`,
        };

        await db.query(
            'INSERT INTO team_members (id, name, email, role, password, avatar) VALUES (?, ?, ?, ?, ?, ?)',
            [newMember.id, newMember.name, newMember.email, newMember.role, newMember.password, newMember.avatar]
        );

        const { password: _, ...memberData } = newMember;
        res.status(201).json(memberData);
    } catch (error) {
        console.error("Failed to create team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a team member
router.put('/:id', protect, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM team_members WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        let updateQuery = 'UPDATE team_members SET name = ?, email = ?, role = ?';
        const queryParams = [name, email, role];

        if (password) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            updateQuery += ', password = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        await db.query(updateQuery, queryParams);

        const [updatedRows] = await db.query('SELECT id, name, role, email, avatar FROM team_members WHERE id = ?', [id]);
        res.json(updatedRows[0]);

    } catch (error) {
        console.error("Failed to update team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a team member
router.delete('/:id', protect, adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT role FROM team_members WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        if (rows[0].role === 'Super Admin') {
            return res.status(400).json({ message: 'Cannot delete the Super Admin account.' });
        }

        const [result] = await db.query('DELETE FROM team_members WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Failed to delete team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;