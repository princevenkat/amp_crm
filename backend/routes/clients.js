import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';

import { Client } from 'basic-ftp'; // Import the FTP client

import multer from 'multer';
import path from 'path';  // <-- needed for file extensions
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

import { put, del } from '@vercel/blob';

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();


// export const syncLedgerFromFees = async (connection, client) => {
//     if (!client?.productDetails?.mortgage?.fees?.length) return;

//     const fees = client.productDetails.mortgage.fees;
//     const clientId = client.id;
//     const clientName = client.name;

//     const ownerId =
//         client.primaryAdvisor?.id ||
//         client.primaryAdvisor ||
//         client.createdBy ||
//         'usr-system';

//     const allowedTypes = [
//         'Broker Fee',
//         'Procuration Fee',
//         'Referral Fee',
//         'Other',
//         'Commission',
//     ];

//     for (const fee of fees) {
//         if (!fee?.amount || !fee?.type) continue;

//         const normalizedType = fee.type.trim();
//         if (normalizedType === 'Expense') continue;
//         if (!allowedTypes.includes(normalizedType)) continue;

//         const date = fee.date ? fee.date.split('T')[0] : new Date().toISOString().split('T')[0];
//         const amount = parseFloat(fee.amount) || 0;
//         const description = fee.name?.trim() || normalizedType;

//         const ledgerType = normalizedType;

//         // ⚡ Use flexible duplicate check (by clientId, type, description only)
//         const [existing] = await connection.query(
//             `SELECT id, amount FROM ledger_entries 
//              WHERE clientId = ? AND description = ? AND type = ?`,
//             [clientId, description, ledgerType]
//         );

//         if (existing.length) {
//             // Update amount if it changed
//             const existingAmount = parseFloat(existing[0].amount) || 0;
//             if (existingAmount !== amount) {
//                 await connection.query(
//                     `UPDATE ledger_entries 
//                      SET date = ?, ownerId = ?, amount = ? 
//                      WHERE id = ?`,
//                     [date, ownerId, amount, existing[0].id]
//                 );
//                 console.log(`♻️ Updated existing ledger entry: ${description} for ${clientName}`);
//             } else {
//                 // Just update owner/date if needed
//                 await connection.query(
//                     `UPDATE ledger_entries 
//                      SET date = ?, ownerId = ? 
//                      WHERE id = ?`,
//                     [date, ownerId, existing[0].id]
//                 );
//                 console.log(`ℹ️ Ledger entry already exists: ${description} for ${clientName}`);
//             }
//             continue;
//         }

//         // Insert new entry
//         const id = `led-${uuidv4()}`;
//         await connection.query(
//             `INSERT INTO ledger_entries
//              (id, clientId, date, clientName, description, amount, type, pay_status, ownerId)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [id, clientId, date, clientName, description, amount, ledgerType, 'Due', ownerId]
//         );
//         console.log(`✅ Ledger entry added: ${description} ($${amount}) for ${clientName}`);
//     }
// };


export const syncLedgerFromFees = async (connection, client) => {
    if (!client?.productDetails?.mortgage?.fees) return;

    const fees = client.productDetails.mortgage.fees;
    const clientId = client.id;
    const clientName = client.name;

    const ownerId =
        client.primaryAdvisor?.id ||
        client.primaryAdvisor ||
        client.createdBy ||
        'usr-system';

    const allowedTypes = [
        'Broker Fee',
        'Procuration Fee',
        'Referral Fee',
        'Other',
        'Commission',
    ];

    // 1️⃣ Get all existing ledger entries for this client (type in allowedTypes)
    const [existingEntries] = await connection.query(
        `SELECT id, description, type, amount FROM ledger_entries WHERE clientId = ? AND type IN (?)`,
        [clientId, allowedTypes]
    );

    // 2️⃣ Mark entries that still exist
    const matchedEntryIds = new Set();

    for (const fee of fees) {
        if (!fee?.amount || !fee?.type) continue;

        const normalizedType = fee.type.trim();
        if (normalizedType === 'Expense' || !allowedTypes.includes(normalizedType)) continue;

        const date = fee.date ? fee.date.split('T')[0] : new Date().toISOString().split('T')[0];
        const amount = parseFloat(fee.amount) || 0;
        const description = fee.name?.trim() || normalizedType;
        const ledgerType = normalizedType;

        // Try to find a matching existing ledger entry
        const existing = existingEntries.find(
            (e) => e.type === ledgerType && e.description === description
        );

        if (existing) {
            // Update amount/owner/date if needed
            const existingAmount = parseFloat(existing.amount) || 0;
            if (existingAmount !== amount || existing.ownerId !== ownerId) {
                await connection.query(
                    `UPDATE ledger_entries SET amount = ?, date = ?, ownerId = ? WHERE id = ?`,
                    [amount, date, ownerId, existing.id]
                );
            }
            matchedEntryIds.add(existing.id); // mark as matched
        } else {
            // Insert new ledger entry
            const id = `led-${uuidv4()}`;
            await connection.query(
                `INSERT INTO ledger_entries
                 (id, clientId, date, clientName, description, amount, type, pay_status, ownerId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, clientId, date, clientName, description, amount, ledgerType, 'Due', ownerId]
            );
        }
    }

    // 3️⃣ Remove obsolete ledger entries (fees no longer exist)
    for (const existing of existingEntries) {
        if (!matchedEntryIds.has(existing.id)) {
            await connection.query(`DELETE FROM ledger_entries WHERE id = ?`, [existing.id]);
        }
    }
};



const upload = multer({ storage: multer.memoryStorage() });

// Hostinger FTP Connection Details
const ftpClient = new Client();
const FTP_CONFIG = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === 'true', // converts "true"/"false" to boolean
};

// ✅ Upload route for documents
router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;

    // ✅ Use system temp directory (always writable)
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, fileName);

    // ✅ Write the file temporarily
    fs.writeFileSync(tempFilePath, file.buffer);

    // ✅ Create new FTP client instance
    // const ftpClient = new FTPClient();

    try {
        // Connect to FTP
        await ftpClient.access({
            host: FTP_CONFIG.host,
            user: FTP_CONFIG.user,
            password: FTP_CONFIG.password,
            secure: FTP_CONFIG.secure,
        });

        // ✅ Ensure remote directory exists
        const remoteDir = `/crm_uploads/clients/${id}`;
        await ftpClient.ensureDir(remoteDir);

        // ✅ Upload file to FTP server
        await ftpClient.uploadFrom(tempFilePath, `${remoteDir}/${fileName}`);

        // ✅ Clean up temp file
        fs.unlinkSync(tempFilePath);

        // ✅ Save record to DB
        const docId = uuidv4();
        const fileUrl = `https://advancemortgages.co.uk/crm_uploads/clients/${id}/${fileName}`;

        await db.query(
            'INSERT INTO documents (id, clientId, filename, filetype, uploadDate, url) VALUES (?, ?, ?, ?, ?, ?)',
            [docId, id, file.originalname, path.extname(file.originalname).slice(1), new Date(), fileUrl]
        );

        res.status(201).json({
            id: docId,
            clientId: id,
            fileName: file.originalname,
            fileType: path.extname(file.originalname).slice(1),
            uploadDate: new Date().toISOString().split('T')[0],
            url: fileUrl,
        });

    } catch (err) {
        console.error('❌ Error uploading file to Hostinger FTP:', err);
        res.status(500).json({ message: 'Failed to upload document.' });
    } finally {
        ftpClient.close();
    }
});

// 🧹 DELETE document route (Fixed)
router.delete("/:clientId/documents/:docId", protect, async (req, res) => {
    const { clientId, docId } = req.params;
    // const ftpClient = new FTPClient();

    try {
        // 1️⃣ Get document details from DB
        const [rows] = await db.query("SELECT * FROM documents WHERE id = ?", [docId]);
        if (!rows.length) {
            return res.status(404).json({ message: "Document not found" });
        }

        const document = rows[0];
        const fileName = document.url.split("/").pop(); // Extract file name
        const remotePath = `/crm_uploads/clients/${clientId}/${fileName}`; // ✅ match upload path

        // 2️⃣ Connect to FTP
        await ftpClient.access({
            host: FTP_CONFIG.host,
            user: FTP_CONFIG.user,
            password: FTP_CONFIG.password,
            secure: FTP_CONFIG.secure || false,
        });

        // 3️⃣ Try to remove file
        try {
            await ftpClient.remove(remotePath);
            console.log(`✅ Deleted from FTP: ${remotePath}`);
        } catch (ftpErr) {
            console.warn(`⚠️ File not found on FTP:`, ftpErr.message);
        }

        // 4️⃣ Delete DB record
        await db.query("DELETE FROM documents WHERE id = ?", [docId]);

        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting document:", err.message);
        res.status(500).json({ message: "Failed to delete document", error: err.message });
    } finally {
        ftpClient.close();
    }
});

// Helper to format MySQL dates safely to 'YYYY-MM-DD'
const formatDate = (date) => {
    if (!date) return null;
    try {
        // MySQL sometimes returns JS Date or string, so normalize both
        return new Date(date).toISOString().split('T')[0];
    } catch {
        return null;
    }
};
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


// Helper to reconstruct the full client object from DB rows
const hydrateClient = async (clientRow) => {
    if (!clientRow) return null;

    // Fetch related data in parallel
    const [
        [applicants],
        [mortgageRows],
        [protectionRows],
        [bcRows],
        [documents],
        [notes],
        [contactsData]
    ] = await Promise.all([
        db.query('SELECT * FROM applicants WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM mortgage_details WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM protection_details WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM bc_details WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM documents WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM notes WHERE clientId = ? ORDER BY date DESC', [clientRow.id]),
        db.query(
            `SELECT id, name, email, phone, company, address, type 
       FROM contacts 
       WHERE id IN (?, ?, ?, ?)`,
            [
                clientRow.solicitor_id,
                clientRow.accountant_id,
                clientRow.surveyor_id,
                clientRow.estate_agent_id
            ]
        ),
    ]);


    // Helper function to get contact by ID from the already fetched data
    function getContact(id) {
        if (!id) return null;
        return contactsData.find(c => c.id === id) || null;
    }

    // Find each contact by ID
    const solicitor = getContact(clientRow.solicitor_id);
    const accountant = getContact(clientRow.accountant_id);
    const surveyor = getContact(clientRow.surveyor_id);
    const estateAgent = getContact(clientRow.estate_agent_id);

    // ✅ Format applicant DOB
    applicants.forEach(app => {
        app.dob = formatDateForInput(app.dob);
    });


    // ✅ Keep DOB as string from DB to avoid timezone shift
    applicants.forEach(app => {
        app.dob = formatDateForInput(app.dob);
    });



    let limitedCompany = null;
    try {
        if (clientRow.limited_company) {
            // Handle both JSON strings and already-parsed objects safely
            limitedCompany =
                typeof clientRow.limited_company === 'string'
                    ? JSON.parse(clientRow.limited_company)
                    : clientRow.limited_company;
        }
    } catch (err) {
        console.error('Failed to parse limited_company JSON:', err);
        limitedCompany = null;
    }


    // ✅ FIX: Parse caseWorker JSON safely
    let caseWorker = null;
    try {
        const raw = clientRow.caseWorker || clientRow.case_worker; // supports snake_case or camelCase
        if (raw) {
            caseWorker = typeof raw === "string" ? JSON.parse(raw) : raw;
        }
    } catch (err) {
        console.error("Failed to parse caseWorker JSON:", err);
        caseWorker = null;
    }

    // Re-nest flattened properties back into objects
    const client = {
        id: clientRow.id,
        name: clientRow.name,
        email: clientRow.email,
        phone: clientRow.phone,
        caseReference: clientRow.caseReference,
        primaryAdvisor: clientRow.primaryAdvisor,
        admin: clientRow.admin,
        applicationType: clientRow.applicationType,
        status: clientRow.status,
        caseStatus: clientRow.caseStatus,
        lastContacted: clientRow.lastContacted ? clientRow.lastContacted.toISOString().split('T')[0] : null,
        createdDate: clientRow.created_date ? clientRow.created_date.toISOString().split('T')[0] : null,
        avatar: clientRow.avatar,
        value: clientRow.value,
        product: { type: clientRow.productType },
        applicants,
        documents,
        caseWorker,
        notes,
        property: {
            address: clientRow.propertyAddress,
            propertyValue: clientRow.propertyValue,
            purchasePrice: clientRow.purchasePrice,
            dateOfPurchase: clientRow.dateOfPurchase,
            yearBuilt: clientRow.yearBuilt,
            propertyType: clientRow.propertyTypeProp,
            isExLocal: !!clientRow.isExLocal,
            bedrooms: clientRow.bedrooms,
            livingRooms: clientRow.livingRooms,
            kitchens: clientRow.kitchens,
            bathrooms: clientRow.bathrooms,
            separateToilets: clientRow.separateToilets,
            hasGarageOrParking: !!clientRow.hasGarageOrParking,
            flatsInBlock: clientRow.flatsInBlock,
            storeysInBlock: clientRow.storeysInBlock,
            floorOfFlat: clientRow.floorOfFlat,
            leaseRemaining: clientRow.leaseRemaining,
            groundRent: clientRow.groundRent,
            serviceCharge: clientRow.serviceCharge,
        },
        productDetails: {
            businessWritten: clientRow.businessWritten,
            // mortgage: mortgageRows[0] || null,
            mortgage: {
                ...(mortgageRows[0] || {}),
                //fees: clientRow.mortgageFees ? JSON.parse(clientRow.mortgageFees) : [],

                fees: (() => {
                    const f = clientRow.mortgageFees;
                    if (!f) return [];
                    if (typeof f === 'string') {
                        try {
                            return JSON.parse(f);
                        } catch {
                            return [];
                        }
                    }
                    return Array.isArray(f) ? f : [];
                })(),
            },
            solicitor,
            accountant,
            surveyor,
            estateAgent,
            limitedCompany,
            protection: protectionRows[0] || null,
            bandc: bcRows[0] || null,
        }
    };

    // ✅ Add this line to make Personal tab work
    client.personal = applicants[0] || null;

    return client;

};


const ALL_CLIENT_FIELDS_FOR_UPDATE = `
  name = ?, email = ?, phone = ?, caseReference = ?, primaryAdvisor = ?, admin = ?,
  applicationType = ?, status = ?, caseStatus = ?, lastContacted = ?, value = ?, productType = ?,
  propertyAddress = ?, propertyValue = ?, purchasePrice = ?, dateOfPurchase = ?, yearBuilt = ?, propertyTypeProp = ?,
  isExLocal = ?, bedrooms = ?, livingRooms = ?, kitchens = ?, bathrooms = ?, separateToilets = ?,
  hasGarageOrParking = ?, flatsInBlock = ?, storeysInBlock = ?, floorOfFlat = ?, leaseRemaining = ?,
  groundRent = ?, serviceCharge = ?, businessWritten = ?, mortgageFees = ?,
  solicitor_id = ?, accountant_id = ?, surveyor_id = ?, estate_agent_id = ?, introducer = ?
`;

const toMySQLDateTime = (isoDate) => {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (isNaN(d)) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
};
const toMySQLDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

const getClientDataAsArray = (clientData) => [
    clientData.name,
    clientData.email,
    clientData.phone,
    clientData.caseReference,
    clientData.primaryAdvisor,
    clientData.admin,
    clientData.applicationType,
    clientData.status,
    clientData.caseStatus,
    toMySQLDateTime(clientData.lastContacted),
    clientData.value,
    clientData.product?.type,
    clientData.property?.address,
    clientData.property?.propertyValue,
    clientData.property?.purchasePrice,
    toMySQLDate(clientData.property?.dateOfPurchase),
    clientData.property?.yearBuilt,
    clientData.property?.propertyType,
    clientData.property?.isExLocal,
    clientData.property?.bedrooms,
    clientData.property?.livingRooms,
    clientData.property?.kitchens,
    clientData.property?.bathrooms,
    clientData.property?.separateToilets,
    clientData.property?.hasGarageOrParking,
    clientData.property?.flatsInBlock,
    clientData.property?.storeysInBlock,
    clientData.property?.floorOfFlat,
    clientData.property?.leaseRemaining,
    clientData.property?.groundRent,
    clientData.property?.serviceCharge,
    clientData.productDetails?.businessWritten,
    JSON.stringify(clientData.productDetails?.mortgage?.fees || []),
    clientData.productDetails?.solicitor?.id || null,
    clientData.productDetails?.accountant?.id || null,
    clientData.productDetails?.surveyor?.id || null,
    clientData.productDetails?.estateAgent?.id || null,
    clientData.introducer || null,
];


router.get('/', protect, async (req, res) => {
    try {
        const user = req.user; // populated from JWT by protect middleware
        let clientRows = [];

        if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Marketing') {
            // 🟢 Admin sees all clients
            [clientRows] = await db.query(`
                SELECT * FROM clients 
                ORDER BY createdDate DESC
            `);
        }
        else if (user.role === 'Advisor' || user.role === 'Adviser') {
            // 🟠 Advisor sees only their own or assigned clients
            [clientRows] = await db.query(`
                SELECT * FROM clients
                WHERE primaryAdvisor = ? OR createdBy = ?
                ORDER BY createdDate DESC
            `, [user.id, user.id]);
        }

        else {
            // 🚫 No valid role
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        // Hydrate the client data (attach applicants, documents, etc.)
        const hydratedClients = await Promise.all(clientRows.map(hydrateClient));

        res.json(hydratedClients);
    } catch (error) {
        console.error("Failed to get clients:", error);
        res.status(500).json({ message: "Server error getting clients" });
    }
});


// Create a new client
router.post('/', protect, async (req, res) => {
    const clientData = req.body;
    const newId = `cli-${uuidv4()}`;
    // const avatar = `https://picsum.photos/seed/${clientData.name.split(' ')[0]}/100/100`;
    const avatar = ``;
    const connection = await db.getConnection();

    const createdBy = req.user.id;


    try {
        await connection.beginTransaction();

        // Flattened client data for insertion
        const clientInsertData = {
            id: newId,
            avatar,
            createdBy,
            createdDate: clientData.createdDate,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            caseReference: clientData.caseReference,
            primaryAdvisor: clientData.primaryAdvisor,
            admin: clientData.admin,
            applicationType: clientData.applicationType,
            status: clientData.status,
            caseStatus: clientData.caseStatus,
            lastContacted: clientData.lastContacted,
            value: clientData.value,
            productType: clientData.product?.type,
            propertyAddress: clientData.property?.address,
            propertyValue: clientData.property?.propertyValue,
            purchasePrice: clientData.property?.purchasePrice,
            dateOfPurchase: clientData.property?.dateOfPurchase || null,
            yearBuilt: clientData.property?.yearBuilt || null,
            propertyTypeProp: clientData.property?.propertyType || null, // Aliased field
            isExLocal: clientData.property?.isExLocal,
            bedrooms: clientData.property?.bedrooms,
            livingRooms: clientData.property?.livingRooms,
            kitchens: clientData.property?.kitchens,
            bathrooms: clientData.property?.bathrooms,
            separateToilets: clientData.property?.separateToilets,
            hasGarageOrParking: clientData.property?.hasGarageOrParking,
            businessWritten: clientData.productDetails?.businessWritten,
            mortgageFees: JSON.stringify(clientData.productDetails?.mortgage?.fees || []), // 🟢 add this line           
            solicitor_id: clientData.productDetails?.solicitor?.id || null,
            accountant_id: clientData.productDetails?.accountant?.id || null,
            surveyor_id: clientData.productDetails?.surveyor?.id || null,
            estate_agent_id: clientData.productDetails?.estateAgent?.id || null,
            introducer: clientData.introducer,
        };

        const columns = Object.keys(clientInsertData).join(', ');
        const placeholders = Object.keys(clientInsertData).map(() => '?').join(', ');
        const values = Object.values(clientInsertData);

        await connection.query(`INSERT INTO clients (${columns}) VALUES (${placeholders})`, values);


        // 2. Insert applicants
        // if (clientData.applicants && clientData.applicants.length > 0) {
        //     for (const app of clientData.applicants) {
        //         // await connection.query(
        //         //     `INSERT INTO applicants (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        //         //     [newId, app.title, app.firstName, app.middleName, app.surname, app.gender, app.dob, app.homeTelephone, app.mobileNumber, app.email, app.currentAddress, app.noOfDependents, app.nationality]
        //         // );

        //         const dob = applicant.dob;
        //         await connection.query(
        //             `INSERT INTO applicants (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality) 
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        //             [id, app.title, app.firstName, app.middleName, app.surname, app.gender, dob, app.homeTelephone, app.mobileNumber, app.email, app.currentAddress, app.noOfDependents, app.nationality]
        //         );
        //     }
        // }


        if (clientData.applicants && clientData.applicants.length > 0) {
            for (const app of clientData.applicants) {
                const dob = app.dob || null;
                await connection.query(
                    `INSERT INTO applicants 
            (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality, introducer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newId, app.title, app.firstName, app.middleName, app.surname, app.gender, dob, app.homeTelephone, app.mobileNumber, app.email, app.currentAddress, app.noOfDependents, app.nationality, app.introducer]
                );
            }
        }

        //await connection.commit();

        // 🔹 Sync Ledger Entries (inside same transaction)
        // await syncLedgerFromFees(connection, clientData);
        // ✅ Commit once — includes both client + ledger inserts

        // // ✅ Re-fetch the full client from DB (with mortgageFees loaded)
        // const [freshClientRows] = await connection.query('SELECT * FROM clients WHERE id = ?', [newId]);
        // const freshClient = await hydrateClient(freshClientRows[0]);

        // // ✅ Now sync ledger with actual fees
        // await syncLedgerFromFees(connection, freshClient);
        await connection.commit();

        const [newClientRow] = await db.query('SELECT * FROM clients WHERE id = ?', [newId]);
        const newClient = await hydrateClient(newClientRow[0]);
        res.status(201).json(newClient);
    } catch (error) {
        await connection.rollback();
        console.error("Failed to create client:", error);
        res.status(500).json({ message: "Server error during client creation." });
    } finally {
        connection.release();
    }
});





// Update a client (including converting to client)
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 🧩 1️⃣ Fetch current client record
        const [rows] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
        if (!rows.length) {
            await connection.rollback();
            return res.status(404).json({ message: 'Client not found' });
        }
        const current = rows[0];

        // 🧩 2️⃣ Simple field-only update (like { status: 'Pipeline' })
        const simpleFields = ['status', 'caseStatus', 'primaryAdvisor', 'admin'];
        const isSimpleUpdate = Object.keys(updates).every((key) => simpleFields.includes(key));

        if (isSimpleUpdate) {
            const sets = Object.keys(updates)
                .map((key) => `${key} = ?`)
                .join(', ');
            const values = Object.values(updates);
            await connection.query(`UPDATE clients SET ${sets} WHERE id = ?`, [...values, id]);
            await connection.commit();

            const [updatedRows] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
            const updatedClient = await hydrateClient(updatedRows[0]);
            return res.json(updatedClient);
        }

        // 🧩 3️⃣ Otherwise do full merge update (for full client edit)
        const merged = { ...current, ...updates };

        const clientFields = getClientDataAsArray(merged);
        await connection.query(
            `UPDATE clients SET ${ALL_CLIENT_FIELDS_FOR_UPDATE} WHERE id = ?`,
            [...clientFields, id]
        );


        // --- limited company details ---
        if (merged.productDetails?.limitedCompany) {
            // Convert to JSON string for MySQL
            const limitedCompanyJson = JSON.stringify(merged.productDetails.limitedCompany);

            await connection.query(
                `UPDATE clients SET limited_company = ? WHERE id = ?`,
                [limitedCompanyJson, id]
            );
        }


        // --- applicants update ---
        if (merged.applicants) {
            await connection.query('DELETE FROM applicants WHERE clientId = ?', [id]);
            for (const app of merged.applicants) {
                await connection.query(
                    `INSERT INTO applicants 
            (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality, introducer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        app.title || '',
                        app.firstName || '',
                        app.middleName || '',
                        app.surname || '',
                        app.gender || '',
                        app.dob || null,
                        app.homeTelephone || '',
                        app.mobileNumber || '',
                        app.email || '',
                        app.currentAddress || '',
                        app.noOfDependents || 0,
                        app.nationality || '',
                        app.introducer || '',
                    ]
                );
            }
        }

        // --- caseWorker update ---
        if (merged.caseWorker) {
            const caseWorkerJson = JSON.stringify(merged.caseWorker);
            await connection.query(
                `UPDATE clients SET caseWorker = ? WHERE id = ?`,
                [caseWorkerJson, id]
            );
        }

        // --- notes update ---
        if (merged.notes) {
            await connection.query('DELETE FROM notes WHERE clientId = ?', [id]);
            for (const note of merged.notes) {
                const noteId = note.id?.startsWith('note-') ? note.id : `note-${uuidv4()}`;
                await connection.query(
                    'INSERT INTO notes (id, clientId, text, author, date) VALUES (?, ?, ?, ?, ?)',
                    [noteId, id, note.text || '', note.author || '', toMySQLDate(note.date)]
                );
            }
        }

        // --- product details: mortgage ---
        await connection.query('DELETE FROM mortgage_details WHERE clientId = ?', [id]);
        if (merged.productDetails?.mortgage) {
            const m = merged.productDetails.mortgage;
            await connection.query(
                `INSERT INTO mortgage_details 
          (clientId, mortgageType, dateOfFma, dateOffered, lender, lenderReference, propertyValue,  mortgageLoanAmount, brokerFees, procurationFees, rate, productType, productTerm, rateExpiry, renewalReminderDate, mortgageTerm, advisor)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    m.mortgageType || '',
                    toMySQLDate(m.dateOfFma),
                    toMySQLDate(m.dateOffered),
                    m.lender || '',
                    m.lenderReference || '',
                    m.propertyValue || 0,
                    m.mortgageLoanAmount || 0,
                    m.brokerFees || 0,
                    m.procurationFees || 0,
                    m.rate || 0,
                    m.productType || '',
                    m.productTerm || '',
                    toMySQLDate(m.rateExpiry),
                    toMySQLDate(m.renewalReminderDate),
                    m.mortgageTerm || '',
                    m.advisor || '',
                ]
            );
        }

        // // --- protection details ---
        // await connection.query('DELETE FROM protection_details WHERE clientId = ?', [id]);
        // if (merged.productDetails?.protection) {
        //     const p = merged.productDetails.protection;

        //     // 🔧 Ensure dateOnRisk is in "YYYY-MM-DD" format
        //     let formattedDateOnRisk = null;
        //     if (p.dateOnRisk) {
        //         // Handle both ISO strings and plain dates safely
        //         const date = new Date(p.dateOnRisk);
        //         if (!isNaN(date.getTime())) {
        //             formattedDateOnRisk = date.toISOString().split('T')[0];
        //         }
        //     }

        //     // Prepare JSON for storage
        //     const protectionJson = JSON.stringify({
        //         ...p,
        //         dateOnRisk: formattedDateOnRisk
        //     });


        //     await connection.query(
        //         `INSERT INTO protection_details 
        //   (clientId, typeOfInsurance, provider, providerReference, amountAssured, term, premium, dateOnRisk, commission, advisor, protection_json) 
        //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        //         [
        //             id,
        //             p.typeOfInsurance || '',
        //             p.provider || '',
        //             p.providerReference || '',
        //             p.amountAssured || 0,
        //             p.term || '',
        //             p.premium || 0,
        //             formattedDateOnRisk,
        //             p.commission || 0,
        //             p.advisor || '',
        //             protectionJson
        //         ]
        //     );
        // }

        // --- protection details ---
        await connection.query('DELETE FROM protection_details WHERE clientId = ?', [id]);

        const protections = merged.productDetails?.protections || [];

        for (const p of protections) {
            // skip empty objects
            if (!p) continue;

            // Format dateOnRisk safely
            let formattedDateOnRisk = null;
            if (p.dateOnRisk) {
                const date = new Date(p.dateOnRisk);
                if (!isNaN(date.getTime())) {
                    formattedDateOnRisk = date.toISOString().split('T')[0];
                }
            }

            // Prepare JSON for storage
            const protectionJson = JSON.stringify(merged.productDetails.protections || []);

            await connection.query(
                `INSERT INTO protection_details 
     (clientId, protection_json)
     VALUES (?, ?) 
     ON DUPLICATE KEY UPDATE protection_json = VALUES(protection_json)`,
                [id, protectionJson]
            );
        }




        // --- Building & Content details ---
        await connection.query('DELETE FROM bc_details WHERE clientId = ?', [id]);
        if (merged.productDetails?.bandc) {
            const p = merged.productDetails.bandc;

            // 🔧 Ensure dateOnRisk is in "YYYY-MM-DD" format
            let formattedDateOnRisk = null;
            if (p.dateOnRisk) {
                // Handle both ISO strings and plain dates safely
                const date = new Date(p.dateOnRisk);
                if (!isNaN(date.getTime())) {
                    formattedDateOnRisk = date.toISOString().split('T')[0];
                }
            }



            await connection.query(
                `INSERT INTO bc_details 
          (clientId, typeOfInsurance, provider, providerReference, amountAssured, term, premium, dateOnRisk, commission, advisor) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    p.typeOfInsurance || '',
                    p.provider || '',
                    p.providerReference || '',
                    p.amountAssured || 0,
                    p.term || '',
                    p.premium || 0,
                    formattedDateOnRisk,
                    p.commission || 0,
                    p.advisor || '',
                ]
            );
        }

        // --- ledger sync ---
        if (typeof merged.productDetails?.mortgage?.fees === 'string') {
            try {
                merged.productDetails.mortgage.fees = JSON.parse(merged.productDetails.mortgage.fees);
            } catch (err) {
                console.error('Failed to parse mortgage fees JSON:', err);
            }
        }

        // await syncLedgerFromFees(connection, merged);        
        // await connection.commit();

        // ✅ Re-fetch full client to ensure mortgageFees are loaded correctly
        const [freshClientRows] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
        const freshClient = await hydrateClient(freshClientRows[0]);

        // ✅ Sync ledger entries now
        await syncLedgerFromFees(connection, freshClient);

        // ✅ Commit once
        await connection.commit();

        const [updatedRows] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
        const updatedClient = await hydrateClient(updatedRows[0]);

        res.json(updatedClient);
    } catch (error) {
        await connection.rollback();
        console.error(`Failed to update client ${id}:`, error);
        res.status(500).json({ message: 'Server error during client update.' });
    } finally {
        connection.release();
    }
});




router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Delete from all related tables first
        await connection.query('DELETE FROM applicants WHERE clientId = ?', [id]);
        await connection.query('DELETE FROM documents WHERE clientId = ?', [id]);
        await connection.query('DELETE FROM notes WHERE clientId = ?', [id]);
        await connection.query('DELETE FROM mortgage_details WHERE clientId = ?', [id]);
        await connection.query('DELETE FROM protection_details WHERE clientId = ?', [id]);
        await connection.query('DELETE FROM bc_details WHERE clientId = ?', [id]);
        // Finally delete the client
        const [result] = await connection.query('DELETE FROM clients WHERE id = ?', [id]);

        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(204).send();
    } catch (error) {
        await connection.rollback();
        console.error(`Failed to delete client ${id}:`, error);
        res.status(500).json({ message: "Server error" });
    } finally {
        connection.release();
    }
});



// router.post("/:id/duplicate", protect, async (req, res) => {
//     const { id } = req.params;

//     try {
//         // 1️⃣ Fetch original client
//         const [[clientRows]] = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
//         if (!clientRows) {
//             return res.status(404).json({ message: "Client not found" });
//         }

//         const oldClient = clientRows;

//         // 2️⃣ Create new client ID
//         const newClientId = `cli-${uuidv4()}`;

//         // 3️⃣ Insert new CLIENT (only basic fields)
//         await db.query(
//             `INSERT INTO clients 
//             (id, name, email, phone, applicationType, status, caseStatus, primaryAdvisor, admin, createdDate)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//             [
//                 newClientId,
//                 oldClient.name,
//                 oldClient.email,
//                 oldClient.phone,
//                 oldClient.applicationType,
//                 "Active",                     // reset status
//                 "Initial Enquiry",                     // reset case status
//                 oldClient.primaryAdvisor,
//                 oldClient.admin
//             ]
//         );

//         // 4️⃣ Fetch applicants of original client
//         const [applicants] = await db.query(
//             "SELECT * FROM applicants WHERE clientId = ?",
//             [id]
//         );

//         // 5️⃣ Duplicate all applicants
//         for (const app of applicants) {
//             const newApplicantId = uuidv4();
//             await db.query(
//                 `INSERT INTO applicants 
//                 (id, clientId, firstName, lastName, email, phone, dob, nationality, gender, maritalStatus)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     newApplicantId,
//                     newClientId,
//                     app.firstName,
//                     app.lastName,
//                     app.email,
//                     app.phone,
//                     app.dob,
//                     app.nationality,
//                     app.gender,
//                     app.maritalStatus
//                 ]
//             );
//         }

//         res.json({
//             message: "Client duplicated successfully (applicants copied, rest left empty).",
//             newClientId,
//         });

//     } catch (err) {
//         console.error("❌ Duplicate client error:", err);
//         res.status(500).json({ message: "Error duplicating client." });
//     }
// });


// router.post("/:id/duplicate", protect, async (req, res) => {
//     const { id } = req.params;

//     try {
//         // 1️⃣ Fetch original client
//         const [[oldClient]] = await db.query(
//             "SELECT * FROM clients WHERE id = ?",
//             [id]
//         );
//         if (!oldClient) {
//             return res.status(404).json({ message: "Client not found" });
//         }

//         // 2️⃣ Generate new Client ID
//         const newClientId = `cli-${uuidv4()}`;

//         // 3️⃣ INSERT NEW CLIENT FIRST
//         await db.query(
//             `INSERT INTO clients 
//             (id, name, email, phone, applicationType, status, caseStatus, primaryAdvisor, admin, createdDate)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//             [
//                 newClientId,
//                 oldClient.name,
//                 oldClient.email,
//                 oldClient.phone,
//                 oldClient.applicationType,
//                 "Active",            // reset status
//                 "Initial Enquiry",   // reset case status
//                 oldClient.primaryAdvisor,
//                 oldClient.admin
//             ]
//         );

//         // 4️⃣ Fetch all original applicants
//         const [applicants] = await db.query(
//             "SELECT * FROM applicants WHERE clientId = ?",
//             [id]
//         );

//         // 5️⃣ Duplicate each applicant
//         for (const app of applicants) {
//             await db.query(
//                 `INSERT INTO applicants 
//                 (
//                     clientId,
//                     title,
//                     firstName,
//                     middleName,
//                     surname,
//                     gender,
//                     dob,
//                     homeTelephone,
//                     mobileNumber,
//                     email,
//                     currentAddress,
//                     noOfDependents,
//                     nationality,
//                     introducer
//                 )
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     newClientId,
//                     app.title,
//                     app.firstName,
//                     app.middleName,
//                     app.surname,
//                     app.gender,
//                     app.dob,
//                     app.homeTelephone,
//                     app.mobileNumber,
//                     app.email,
//                     app.currentAddress,
//                     app.noOfDependents,
//                     app.nationality,
//                     app.introducer
//                 ]
//             );
//         }

//         res.json({
//             message: "Client duplicated successfully.",
//             newClientId
//         });

//     } catch (err) {
//         console.error("❌ Duplicate client error:", err);
//         res.status(500).json({ message: "Error duplicating client." });
//     }
// });



router.post("/:id/duplicate", protect, async (req, res) => {
    const { id } = req.params;

    try {
        // 1️⃣ Fetch original client
        const [[oldClient]] = await db.query(
            "SELECT * FROM clients WHERE id = ?",
            [id]
        );

        if (!oldClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        // 2️⃣ Generate new Client ID
        const newClientId = `cli-${uuidv4()}`;


        // Get prefix from old client's caseReference
        const oldCaseRef = oldClient.caseReference; // e.g. "ENQ-608273"
        const prefix = oldCaseRef.split('-')[0];    // "ENQ"

        // Generate a unique new caseReference
        const newCaseReference = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`; // "ENQ-1701162185423"

        // Insert duplicated client
        await db.query(
            `INSERT INTO clients 
    (id, name, email, phone, applicationType, status, caseStatus, primaryAdvisor, admin, caseReference, createdDate)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                newClientId,
                oldClient.name,
                oldClient.email,
                oldClient.phone,
                oldClient.applicationType,
                "Active",            // reset status
                "Initial Enquiry",   // reset case status
                oldClient.primaryAdvisor,
                oldClient.admin,
                newCaseReference,
            ]
        );

        // 5️⃣ Duplicate applicants
        const [applicants] = await db.query(
            "SELECT * FROM applicants WHERE clientId = ?",
            [id]
        );

        for (const app of applicants) {
            await db.query(
                `INSERT INTO applicants 
          (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality, introducer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newClientId,
                    app.title,
                    app.firstName,
                    app.middleName,
                    app.surname,
                    app.gender,
                    app.dob,
                    app.homeTelephone,
                    app.mobileNumber,
                    app.email,
                    app.currentAddress,
                    app.noOfDependents,
                    app.nationality,
                    app.introducer
                ]
            );
        }

        res.json({
            message: "Client duplicated successfully.",
            newClientId,
            newCaseReference
        });

    } catch (err) {
        console.error("❌ Duplicate client error:", err);
        res.status(500).json({ message: "Error duplicating client." });
    }
});


// router.post("/:id/duplicate", protect, async (req, res) => {
//     const { id } = req.params;

//     try {
//         const [[oldClient]] = await db.query("SELECT * FROM clients WHERE id = ?", [id]);

//         if (!oldClient) return res.status(404).json({ message: "Client not found" });

//         const newClientId = `cli-${uuidv4()}`;
//         const oldCaseRef = oldClient.caseReference;
//         const prefix = oldCaseRef.split("-")[0];
//         const newCaseReference = `${prefix}-${Date.now()}`;


//         await db.query(
//             `INSERT INTO clients 
//        (id, name, email, phone, applicationType, status, caseStatus, primaryAdvisor, admin, caseReference, createdDate,  createdBy)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),  ?)`,
//             [
//                 newClientId,
//                 oldClient.name,
//                 oldClient.email,
//                 oldClient.phone,
//                 oldClient.applicationType,
//                 "Active",
//                 "Initial Enquiry",
//                 oldClient.primaryAdvisor,
//                 oldClient.admin,
//                 newCaseReference,
//                 req.user.id,
//             ]
//         );

//         // Duplicate applicants
//         const [applicants] = await db.query("SELECT * FROM applicants WHERE clientId = ?", [id]);
//         for (const app of applicants) {
//             await db.query(
//                 `INSERT INTO applicants 
//          (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality, introducer)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     newClientId,
//                     app.title,
//                     app.firstName,
//                     app.middleName,
//                     app.surname,
//                     app.gender,
//                     app.dob,
//                     app.homeTelephone,
//                     app.mobileNumber,
//                     app.email,
//                     app.currentAddress,
//                     app.noOfDependents,
//                     app.nationality,
//                     app.introducer,
//                 ]
//             );
//         }

//         res.json({ message: "Client duplicated successfully.", newClientId, newCaseReference });
//     } catch (err) {
//         console.error("❌ Duplicate client error:", err);
//         res.status(500).json({ message: "Error duplicating client." });
//     }
// });


export default router;