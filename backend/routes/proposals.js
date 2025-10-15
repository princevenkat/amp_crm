import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all proposals
router.get('/', protect, async (req, res) => {
    try {
        const [proposals] = await db.query('SELECT * FROM proposals ORDER BY sentDate DESC');
        res.json(proposals);
    } catch (error) {
        console.error("Failed to get proposals:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new proposal
router.post('/', protect, async (req, res) => {
    const { clientName, product, status, sentDate, value } = req.body;

    const newProposal = {
        id: `prop-${uuidv4()}`,
        clientName, product, status, sentDate, value
    };

    try {
        await db.query(
            'INSERT INTO proposals (id, clientName, product, status, sentDate, value) VALUES (?, ?, ?, ?, ?, ?)',
            [newProposal.id, newProposal.clientName, newProposal.product, newProposal.status, newProposal.sentDate, newProposal.value]
        );
        res.status(201).json(newProposal);
    } catch (error) {
        console.error("Failed to create proposal:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;