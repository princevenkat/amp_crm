import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all email templates
router.get('/', protect, async (req, res) => {
    try {
        const [templates] = await db.query('SELECT * FROM email_templates ORDER BY name ASC');
        res.json(templates);
    } catch (error) {
        console.error("Failed to get email templates:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new email template
router.post('/', protect, async (req, res) => {
    const { name, subject, lastUpdated } = req.body;
    
    const newTemplate = {
        id: `tmpl-${uuidv4()}`,
        name, subject, lastUpdated
    };

    try {
        await db.query(
            'INSERT INTO email_templates (id, name, subject, lastUpdated) VALUES (?, ?, ?, ?)',
            [newTemplate.id, newTemplate.name, newTemplate.subject, newTemplate.lastUpdated]
        );
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error("Failed to create email template:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;