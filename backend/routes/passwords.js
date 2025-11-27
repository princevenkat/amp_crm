import express from "express";
import db from "../mysql-connector.js";
import { v4 as uuidv4 } from "uuid";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
    TABLES (expected):

    password_entries:
    ----------------------------------------------------
    id (string) PK
    service (string)
    username (string)
    password (string)
    memorablePhrase (string)
    accessLink (string)
    ownerId (string) -> team_members.id

    password_security_questions:
    ----------------------------------------------------
    id (string) PK
    entryId (string) FK -> password_entries.id
    question (string)
    answer (string)
*/

/* ============================================================================
   GET ALL PASSWORD ENTRIES (with security questions)
============================================================================ */
router.get("/", protect, async (req, res) => {
    try {
        // Fetch all entries belonging to logged-in user
        const [entries] = await db.query(
            "SELECT * FROM password_entries"
        );

        // Fetch all questions in one query
        const [questions] = await db.query(
            `SELECT * FROM password_security_questions`
        );

        // Attach questions to entries
        const result = entries.map(entry => ({
            ...entry,
            securityQuestions: questions.filter(q => q.entryId === entry.id)
        }));

        // print(result);

        res.json(result);

    } catch (error) {
        console.error("GET /passwords error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// router.get("/", protect, async (req, res) => {
//     try {
//         let query = "SELECT * FROM password_entries";
//         const params = [];

//         // Restrict non-managers to their own entries
//         if (!req.user.canManage) {
//             query += " WHERE ownerId = ?";
//             params.push(req.user.id);
//         } else if (req.query.ownerId) {
//             // Managers can view a specific user's passwords
//             query += " WHERE ownerId = ?";
//             params.push(req.query.ownerId);
//         }

//         const [entries] = await db.query(query, params);

//         const [questions] = await db.query(
//             `SELECT * FROM password_security_questions`
//         );

//         const result = entries.map(entry => ({
//             ...entry,
//             securityQuestions: questions.filter(q => q.entryId === entry.id)
//         }));

//         res.json(result);
//     } catch (error) {
//         console.error("GET /passwords error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });


/* ============================================================================
   CREATE NEW PASSWORD ENTRY
============================================================================ */
router.post("/", protect, async (req, res) => {
    try {
        const id = uuidv4();
        const {
            service,
            provider_lenders,
            username,
            password,
            memorablePhrase,
            accessLink,
            securityQuestions = []
        } = req.body;

        await db.query(
            `INSERT INTO password_entries 
             (id, service, provider_lenders, username, password, memorablePhrase, accessLink, ownerId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                service || "",
                provider_lenders || "",
                username || "",
                password || "",
                memorablePhrase || "",
                accessLink || "",
                req.user.id
            ]
        );

        // Insert security questions
        for (const sq of securityQuestions) {
            await db.query(
                `INSERT INTO password_security_questions (id, entryId, question, answer)
                 VALUES (?, ?, ?, ?)`,
                [uuidv4(), id, sq.question, sq.answer]
            );
        }

        res.json({ success: true, id });

    } catch (error) {
        console.error("POST /passwords error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* ============================================================================
   UPDATE PASSWORD ENTRY
============================================================================ */
// router.put("/:id", protect, async (req, res) => {
//     const { id } = req.params;

//     try {
//         const {
//             service,
//             username,
//             password,
//             memorablePhrase,
//             accessLink,
//             securityQuestions = [],
//             ownerId,
//         } = req.body;

//         // Update main entry
//         // await db.query(
//         //     `UPDATE password_entries
//         //      SET service=?, username=?, password=?, memorablePhrase=?, accessLink=?, ownerId=?
//         //      WHERE id=? AND ownerId=?`,
//         //     [
//         //         service || "",
//         //         username || "",
//         //         password || "",
//         //         memorablePhrase || "",
//         //         accessLink || "",
//         //         id,
//         //         ownerId || req.user.id,
//         //         req.user.id
//         //     ]
//         // );

//         await db.query(
//             `UPDATE password_entries
//      SET service=?, username=?, password=?, memorablePhrase=?, accessLink=?, ownerId=?
//      WHERE id=? AND ownerId=?`,
//             [
//                 service || "",
//                 username || "",
//                 password || "",
//                 memorablePhrase || "",
//                 accessLink || "",
//                 ownerId || req.user.id,   // NEW OWNER ID
//                 id,                       // ENTRY ID
//                 req.user.id               // OLD OWNER (must match)
//             ]
//         );

//         // Remove old questions
//         await db.query(
//             `DELETE FROM password_security_questions WHERE entryId=?`,
//             [id]
//         );

//         // Insert new questions
//         for (const sq of securityQuestions) {
//             await db.query(
//                 `INSERT INTO password_security_questions (id, entryId, question, answer)
//                  VALUES (?, ?, ?, ?)`,
//                 [uuidv4(), id, sq.question, sq.answer]
//             );
//         }

//         res.json({ success: true });

//     } catch (error) {
//         console.error("PUT /passwords error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });


router.put("/:id", protect, async (req, res) => {
    const { id } = req.params;

    try {
        const {
            service,
            provider_lenders,
            username,
            password,
            memorablePhrase,
            accessLink,
            securityQuestions = [],
            ownerId,
        } = req.body;

        // Update main entry (any user can update)
        await db.query(
            `UPDATE password_entries
             SET service=?, provider_lenders=?, username=?, password=?, memorablePhrase=?, accessLink=?, ownerId=?
             WHERE id=?`,
            [
                service || "",
                provider_lenders || "",
                username || "",
                password || "",
                memorablePhrase || "",
                accessLink || "",
                ownerId || null, // new ownerId if provided
                id               // entry ID
            ]
        );

        // Remove old security questions
        await db.query(`DELETE FROM password_security_questions WHERE entryId=?`, [id]);

        // Insert new security questions
        for (const sq of securityQuestions) {
            await db.query(
                `INSERT INTO password_security_questions (id, entryId, question, answer)
                 VALUES (?, ?, ?, ?)`,
                [uuidv4(), id, sq.question, sq.answer]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("PUT /passwords error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
/* ============================================================================
   DELETE PASSWORD ENTRY
============================================================================ */
router.delete("/:id", protect, async (req, res) => {
    const { id } = req.params;

    try {
        // Delete questions first
        await db.query(
            `DELETE FROM password_security_questions WHERE entryId=?`,
            [id]
        );

        // Delete entry
        await db.query(
            `DELETE FROM password_entries WHERE id=? AND ownerId=?`,
            [id, req.user.id]
        );

        res.json({ success: true });

    } catch (error) {
        console.error("DELETE /passwords error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
