import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all tasks
router.get('/', protect, async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks ORDER BY dueDate ASC');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new task
router.post('/', protect, async (req, res) => {
    const { title, description, dueDate, status, assignedTo, assignedBy, clientId } = req.body;
    const newTask = {
        id: `task-${uuidv4()}`,
        title, description, dueDate, status, assignedTo, assignedBy,
        clientId: clientId || null
    };

    try {
        await db.query(
            'INSERT INTO tasks (id, title, description, dueDate, status, assignedTo, assignedBy, clientId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newTask.id, newTask.title, newTask.description, newTask.dueDate, newTask.status, newTask.assignedTo, newTask.assignedBy, newTask.clientId]
        );
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update a task
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, status, assignedTo, assignedBy, clientId } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE tasks SET title = ?, description = ?, dueDate = ?, status = ?, assignedTo = ?, assignedBy = ?, clientId = ? WHERE id = ?',
            [title, description, dueDate, status, assignedTo, assignedBy, clientId || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const [updatedTaskRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(updatedTaskRows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a task
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
