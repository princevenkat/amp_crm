import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../mysql-connector.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟩 Get all tasks (with role-based access)
// router.get("/", protect, async (req, res) => {
//     try {
//         const { role, id: userId, name, fullName, email } = req.user;

//         let query = "";
//         let params = [];

//         // Determine identifier consistently with creation
//         const userIdentifier = name || fullName || email || userId;

//         if (role === "Adviser") {
//             query = `
//         SELECT * FROM tasks
//         WHERE LOWER(assignedTo) = LOWER(?) 
//            OR LOWER(assignedBy) = LOWER(?)
//         ORDER BY dueDate ASC
//       `;
//             params = [userIdentifier, userIdentifier];
//         }

//         // Admins see all
//         else if (role === "Admin" || role === "Super Admin" || role === "Marketing") {
//             query = "SELECT * FROM tasks ORDER BY dueDate ASC";
//         }

//         // Fallback for unknown role
//         else {
//             query = `
//         SELECT * FROM tasks
//         WHERE LOWER(assignedTo) = LOWER(?)
//            OR LOWER(assignedBy) = LOWER(?)
//         ORDER BY dueDate ASC
//       `;
//             params = [userIdentifier, userIdentifier];
//         }

//         const [tasks] = await db.query(query, params);
//         res.json(tasks);
//     } catch (error) {
//         console.error("❌ Failed to get tasks:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// 🟩 Get all tasks (with role-based access) + caseReference
router.get("/", protect, async (req, res) => {
    try {
        const { role, id: userId, name, fullName, email } = req.user;
        const userIdentifier = (name || fullName || email || userId).toLowerCase();

        let query = "";
        let params = [];

        if (role === "Adviser") {
            query = `
        SELECT t.*, COALESCE(c.caseReference, 'N/A') AS caseReference, c.name AS clientName
        FROM tasks t
        LEFT JOIN clients c ON t.clientId = c.id
        WHERE LOWER(t.assignedTo) = ? OR LOWER(t.assignedBy) = ?
        ORDER BY t.dueDate ASC
      `;
            params = [userIdentifier, userIdentifier];
        } else if (role === "Admin" || role === "Super Admin" || role === "Marketing") {
            query = `
        SELECT t.*, COALESCE(c.caseReference, 'N/A') AS caseReference, c.name AS clientName
        FROM tasks t
        LEFT JOIN clients c ON t.clientId = c.id
        ORDER BY t.dueDate ASC
      `;
        } else {
            // fallback: same as Adviser
            query = `
        SELECT t.*, COALESCE(c.caseReference, 'N/A') AS caseReference, c.name AS clientName
        FROM tasks t
        LEFT JOIN clients c ON t.clientId = c.id
        WHERE LOWER(t.assignedTo) = ? OR LOWER(t.assignedBy) = ?
        ORDER BY t.dueDate ASC
      `;
            params = [userIdentifier, userIdentifier];
        }

        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (error) {
        console.error("❌ Failed to get tasks:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// 🟩 Create new task
router.post("/", protect, async (req, res) => {
    const { title, description, dueDate, status, assignedTo, assignedBy, clientId } = req.body;

    // ✅ Ensure valid status
    const validStatuses = ['Enquiry', 'AIP', 'FMA', 'Offered', 'Completed', 'Commission Due', 'NPW'];
    const normalizedStatus = validStatuses.includes(status) ? status : 'Enquiry';

    // ✅ Default assignedBy / assignedTo to current logged-in user if missing
    const currentUserName = req.user?.name || req.user?.fullName || 'Unknown User';

    const newTask = {
        id: `task-${uuidv4()}`,
        title,
        description,
        dueDate,
        dueTime: req.body.dueTime || null,
        status: normalizedStatus, // ✅ Correct key name
        assignedTo: assignedTo || currentUserName,
        assignedBy: assignedBy || currentUserName,
        clientId: clientId || null,
    };

    try {
        //         await db.query(
        //             //         `INSERT INTO tasks 
        //             //    (id, title, description, dueDate, dueTime, status, assignedTo, assignedBy, clientId,created_at, updated_at)
        //             //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        //             `INSERT INTO tasks
        //   (id, title, description, dueDate, dueTime, status, assignedTo, assignedBy, clientId, created_at, updated_at)
        //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        //             [
        //                 newTask.id,
        //                 newTask.title,
        //                 newTask.description,
        //                 newTask.dueDate,
        //                 newTask.status,
        //                 newTask.assignedTo,
        //                 newTask.assignedBy,
        //                 newTask.clientId,
        //             ]
        //         );


        await db.query(
            `INSERT INTO tasks
    (id, title, description, dueDate, dueTime, status, assignedTo, assignedBy, clientId, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                newTask.id,
                newTask.title,
                newTask.description,
                newTask.dueDate,
                newTask.dueTime, // ✅ here
                newTask.status,
                newTask.assignedTo,
                newTask.assignedBy,
                newTask.clientId,
            ]
        );

        // res.status(201).json(newTask);
        res.status(201).json({
            ...newTask,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ Failed to create task:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Update existing task (robust: partial updates, validation, auth checks)
router.put("/:id", protect, async (req, res) => {
    const { id } = req.params;

    const {
        title: incomingTitle,
        description: incomingDescription,
        dueDate: incomingDueDate,
        dueTime: incomingDueTime,
        status: incomingStatus,
        assignedTo: incomingAssignedTo,
        assignedBy: incomingAssignedBy,
        clientId: incomingClientId,
    } = req.body;

    const validStatuses = ['Enquiry', 'AIP', 'FMA', 'Offered', 'Completed', 'Commission Due', 'NPW'];

    try {
        // 1) Load existing task
        const [existingRows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        const existing = existingRows[0];

        // 2) Authorization: Advisers can only update tasks they created
        const { role, id: userId, name: userName, fullName: userFullName, email: userEmail } = req.user;
        const currentUserIdentifiers = [
            (userName || "").toString(),
            (userFullName || "").toString(),
            (userEmail || "").toString(),
            (userId || "").toString(),
        ].filter(Boolean).map(v => v.toLowerCase());

        // if (role === "Adviser") {
        //     const creatorValue = (existing.assignedBy || "").toString().toLowerCase();
        //     if (!currentUserIdentifiers.includes(creatorValue)) {
        //         return res.status(403).json({ message: "You can only update tasks you created" });
        //     }
        // }

        // 3) Prepare updated fields (preserve existing values when incoming values are undefined)
        const title = incomingTitle !== undefined ? incomingTitle : existing.title;
        const description = incomingDescription !== undefined ? incomingDescription : existing.description;
        const dueDate = incomingDueDate !== undefined ? incomingDueDate : existing.dueDate;
        const dueTime = incomingDueTime !== undefined ? incomingDueTime : existing.dueTime || null;


        // validate status
        const status = validStatuses.includes(incomingStatus) ? incomingStatus
            : (incomingStatus ? 'Enquiry' : existing.status || 'Enquiry');

        // assignedBy should default to logged-in user if not provided (prevents spoofing)
        const loggedInName = userName || userFullName || userEmail || userId || "Unknown User";
        const assignedBy = incomingAssignedBy && incomingAssignedBy.toString().trim().length > 0
            ? incomingAssignedBy
            : loggedInName;

        // assignedTo: if incoming provided, use it; otherwise keep existing
        const assignedTo = incomingAssignedTo !== undefined ? incomingAssignedTo : existing.assignedTo;

        // clientId: allow null to clear, otherwise preserve existing if undefined
        const clientId = incomingClientId !== undefined ? (incomingClientId || null) : (existing.clientId || null);

        // 4) Optionally verify assignedTo exists as a team member (helps prevent typos)
        if (assignedTo) {
            const [teamRows] = await db.query(
                "SELECT id FROM team_members WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?) OR id = ? LIMIT 1",
                [assignedTo, assignedTo, assignedTo]
            );
            if (teamRows.length === 0) {
                // If you prefer to allow arbitrary names, change this to a warning instead.
                return res.status(400).json({ message: "assignedTo does not match any team member" });
            }
        }

        // 5) Perform update
        const [updateResult] = await db.query(
            `UPDATE tasks
       SET title = ?, description = ?, dueDate = ?, dueTime = ?, status = ?, assignedTo = ?, assignedBy = ?, clientId = ?,updated_at = NOW()
       WHERE id = ?`,
            [title, description, dueDate, dueTime || null, status, assignedTo, assignedBy, clientId, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to update task" });
        }

        // 6) Return updated row
        const [updatedRows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
        res.json(updatedRows[0]);
    } catch (error) {
        console.error("❌ Failed to update task:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// GET /clients/:id/case-reference
router.get("/clients/:id/case-reference", protect, async (req, res) => {
    const { id: clientId } = req.params;
    const { role, id: userId } = req.user;

    try {
        const [rows] = await db.query(
            `
      SELECT id, name, caseReference
      FROM clients
      WHERE id = ?
      LIMIT 1
      `,
            [clientId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json({
            id: rows[0].id,
            name: rows[0].name,
            caseReference: rows[0].caseReference,
        });


    } catch (error) {
        console.error("❌ Failed to fetch client case reference:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🟩 Delete a task
router.delete("/:id", protect, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Task not found" });

        res.status(204).send();
    } catch (error) {
        console.error("❌ Failed to delete task:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
