import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../mysql-connector.js';
import { protect } from '../middleware/authMiddleware.js';


import multer from 'multer';
import path from 'path';  // <-- needed for file extensions
import fs from 'fs';

import { put, del } from '@vercel/blob';


const router = express.Router();

// ----------------- Multer setup -----------------
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads/';
//         if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${Date.now()}${ext}`);
//     },
// });

// const upload = multer({ storage });


const upload = multer({ storage: multer.memoryStorage() });

// ----------------- Upload document to Vercel Blob -----------------
router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    try {
        // Upload file buffer to Vercel Blob
        const file = req.file;
        const blobKey = `clients/${id}/${Date.now()}-${file.originalname}`;

        const blob = await put(blobKey, file.buffer, {
            access: 'public', // or 'private' if you want signed URLs
            contentType: file.mimetype,
        });

        const docId = uuidv4();

        await db.query(
            'INSERT INTO documents (id, clientId, filename, filetype, uploadDate, url) VALUES (?, ?, ?, ?, ?, ?)',
            [docId, id, file.originalname, path.extname(file.originalname).slice(1), new Date(), blob.url]
        );

        res.status(201).json({
            id: docId,
            clientId: id,
            fileName: file.originalname,
            fileType: path.extname(file.originalname).slice(1),
            uploadDate: new Date().toISOString().split('T')[0],
            url: blob.url,
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Failed to upload document.' });
    }
});

// ----------------- Delete document from Vercel Blob -----------------
router.delete('/documents/:id', protect, async (req, res) => {
    const { id } = req.params;

    try {
        // Get file URL from DB
        const [rows] = await db.query('SELECT url FROM documents WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Document not found' });

        const fileUrl = rows[0].url;

        // Delete file from Blob storage
        await del(fileUrl);

        // Delete from DB
        await db.query('DELETE FROM documents WHERE id = ?', [id]);

        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Failed to delete document.' });
    }
});


// router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
//     const { id } = req.params;
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

//     const file = req.file;
//     const url = `/uploads/${file.filename}`;
//     const docId = `doc-${Date.now()}`;

//     await db.query(
//         'INSERT INTO documents (id, clientId, filename, filetype, uploadDate, url) VALUES (?, ?, ?, ?, ?, ?)',
//         [docId, id, file.originalname, path.extname(file.originalname).slice(1), new Date(), url]
//     );

//     res.status(201).json({
//         id: docId,
//         clientId: id,
//         fileName: file.originalname,
//         fileType: path.extname(file.originalname).slice(1),
//         uploadDate: new Date().toISOString().split('T')[0],
//         url,
//     });
// });
// // DELETE /api/documents/:id
// router.delete('/documents/:id', protect, async (req, res) => {
//     const { id } = req.params;

//     try {
//         // Fetch document info from DB
//         const [rows] = await db.query('SELECT url FROM documents WHERE id = ?', [id]);
//         if (!rows.length) return res.status(404).json({ message: 'Document not found' });

//         const filePath = `uploads/${rows[0].url.split('/').pop()}`; // Adjust if needed
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete file from disk

//         // Delete from database
//         await db.query('DELETE FROM documents WHERE id = ?', [id]);

//         res.json({ message: 'Document deleted successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to delete document' });
//     }
// });
// -------------------------------------------------


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
// Helper to reconstruct the full client object from DB rows
const hydrateClient = async (clientRow) => {
    if (!clientRow) return null;

    // Fetch related data in parallel
    const [
        [applicants],
        [mortgageRows],
        [protectionRows],
        [documents],
        [notes]
    ] = await Promise.all([
        db.query('SELECT * FROM applicants WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM mortgage_details WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM protection_details WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM documents WHERE clientId = ?', [clientRow.id]),
        db.query('SELECT * FROM notes WHERE clientId = ? ORDER BY date DESC', [clientRow.id])
    ]);

    // ✅ Keep DOB as string from DB to avoid timezone shift
    applicants.forEach(app => {
        app.dob = formatDateForInput(app.dob);
    });

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
        notes,

        property: {
            address: clientRow.propertyAddress,
            propertyValue: clientRow.propertyValue,
            purchasePrice: clientRow.purchasePrice,
            dateOfPurchase: clientRow.dateOfPurchase,
            yearBuilt: clientRow.yearBuilt,
            propertyType: clientRow.propertyType,
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
            mortgage: mortgageRows[0] || null,
            protection: protectionRows[0] || null,
            solicitor: {
                name: clientRow.solicitorName,
                company: clientRow.solicitorCompany,
                email: clientRow.solicitorEmail,
                phone: clientRow.solicitorPhone,
            },
            accountant: {
                name: clientRow.accountantName,
                company: clientRow.accountantCompany,
                email: clientRow.accountantEmail,
                phone: clientRow.accountantPhone,
            },
            surveyor: {
                name: clientRow.surveyorName,
                company: clientRow.surveyorCompany,
                email: clientRow.surveyorEmail,
                phone: clientRow.surveyorPhone,
            },
            estateAgent: {
                companyName: clientRow.estateAgentCompanyName,
                personDealingWith: clientRow.estateAgentPerson,
                address: clientRow.estateAgentAddress,
                phone: clientRow.estateAgentPhone,
            },
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
    groundRent = ?, serviceCharge = ?, businessWritten = ?,
    solicitorName = ?, solicitorCompany = ?, solicitorEmail = ?, solicitorPhone = ?,
    accountantName = ?, accountantCompany = ?, accountantEmail = ?, accountantPhone = ?,
    surveyorName = ?, surveyorCompany = ?, surveyorEmail = ?, surveyorPhone = ?,
    estateAgentCompanyName = ?, estateAgentPerson = ?, estateAgentAddress = ?, estateAgentPhone = ?
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
    clientData.name, clientData.email, clientData.phone, clientData.caseReference, clientData.primaryAdvisor, clientData.admin,
    clientData.applicationType, clientData.status, clientData.caseStatus, toMySQLDateTime(clientData.lastContacted), clientData.value, clientData.product?.type,
    clientData.property?.address, clientData.property?.propertyValue, clientData.property?.purchasePrice,
    toMySQLDate(clientData.property?.dateOfPurchase), // ✅ fixed
    clientData.property?.yearBuilt, clientData.property?.propertyType,
    clientData.property?.isExLocal, clientData.property?.bedrooms, clientData.property?.livingRooms, clientData.property?.kitchens, clientData.property?.bathrooms, clientData.property?.separateToilets,
    clientData.property?.hasGarageOrParking, clientData.property?.flatsInBlock, clientData.property?.storeysInBlock, clientData.property?.floorOfFlat, clientData.property?.leaseRemaining,
    clientData.property?.groundRent, clientData.property?.serviceCharge, clientData.productDetails?.businessWritten,
    clientData.productDetails?.solicitor?.name, clientData.productDetails?.solicitor?.company, clientData.productDetails?.solicitor?.email, clientData.productDetails?.solicitor?.phone,
    clientData.productDetails?.accountant?.name, clientData.productDetails?.accountant?.company, clientData.productDetails?.accountant?.email, clientData.productDetails?.accountant?.phone,
    clientData.productDetails?.surveyor?.name, clientData.productDetails?.surveyor?.company, clientData.productDetails?.surveyor?.email, clientData.productDetails?.surveyor?.phone,
    clientData.productDetails?.estateAgent?.companyName, clientData.productDetails?.estateAgent?.personDealingWith, clientData.productDetails?.estateAgent?.address, clientData.productDetails?.estateAgent?.phone
];


// Get all clients
// router.get('/', protect, async (req, res) => {
//     try {
//         const [clientRows] = await db.query('SELECT * FROM clients ORDER BY createdDate DESC');
//         const hydratedClients = await Promise.all(clientRows.map(hydrateClient));
//         res.json(hydratedClients);
//     } catch (error) {
//         console.error("Failed to get clients:", error);
//         res.status(500).json({ message: "Server error getting clients" });
//     }
// });

router.get('/', protect, async (req, res) => {
    try {
        const user = req.user; // populated from JWT by protect middleware
        let clientRows = [];

        if (user.role === 'Admin' || user.role === 'Super Admin') {
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
    const avatar = `https://picsum.photos/seed/${clientData.name.split(' ')[0]}/100/100`;
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
            propertyTypeProp: clientData.property?.propertyType, // Aliased field
            isExLocal: clientData.property?.isExLocal,
            bedrooms: clientData.property?.bedrooms,
            livingRooms: clientData.property?.livingRooms,
            kitchens: clientData.property?.kitchens,
            bathrooms: clientData.property?.bathrooms,
            separateToilets: clientData.property?.separateToilets,
            hasGarageOrParking: clientData.property?.hasGarageOrParking,
            businessWritten: clientData.productDetails?.businessWritten,
            solicitorName: clientData.productDetails?.solicitor?.name,
            solicitorCompany: clientData.productDetails?.solicitor?.company,
            solicitorEmail: clientData.productDetails?.solicitor?.email,
            solicitorPhone: clientData.productDetails?.solicitor?.phone,
            estateAgentCompanyName: clientData.productDetails?.estateAgent?.companyName,
            estateAgentPerson: clientData.productDetails?.estateAgent?.personDealingWith,
            estateAgentAddress: clientData.productDetails?.estateAgent?.address,
            estateAgentPhone: clientData.productDetails?.estateAgent?.phone,
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
            (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newId, app.title, app.firstName, app.middleName, app.surname, app.gender, dob, app.homeTelephone, app.mobileNumber, app.email, app.currentAddress, app.noOfDependents, app.nationality]
                );
            }
        }

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
    const updates = req.body; // fields from frontend, e.g., { status: 'Client' }
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get existing client
        const [rows] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
        if (!rows.length) {
            await connection.rollback();
            return res.status(404).json({ message: 'Client not found' });
        }

        const current = rows[0];
        const merged = { ...current, ...updates }; // merge updates

        // Update main clients table
        const clientFields = getClientDataAsArray(merged);
        await connection.query(
            `UPDATE clients SET ${ALL_CLIENT_FIELDS_FOR_UPDATE} WHERE id = ?`,
            [...clientFields, id]
        );

        // Update applicants if provided
        if (merged.applicants) {
            await connection.query('DELETE FROM applicants WHERE clientId = ?', [id]);
            for (const app of merged.applicants) {
                await connection.query(
                    `INSERT INTO applicants 
                     (clientId, title, firstName, middleName, surname, gender, dob, homeTelephone, mobileNumber, email, currentAddress, noOfDependents, nationality) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                        app.nationality || ''
                    ]
                );
            }
        }

        // Update notes if provided
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

        // Update mortgage_details if provided
        await connection.query('DELETE FROM mortgage_details WHERE clientId = ?', [id]);
        if (merged.productDetails?.mortgage) {
            const m = merged.productDetails.mortgage;
            await connection.query(
                `INSERT INTO mortgage_details 
                 (clientId, mortgageType, dateOfFma, dateOffered, lender, lenderReference, propertyValue, mortgageLoanAmount, brokerFees, procurationFees, rate, productType, productTerm, rateExpiry, renewalReminderDate, mortgageTerm, advisor)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    m.mortgageType || '',
                    toMySQLDate(m.dateOfFMA),
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
                    toMySQLDate(m.rateExpiry),        // fix here
                    toMySQLDate(m.renewalReminderDate), // fix here
                    m.mortgageTerm || '',
                    m.advisor || ''
                ]
            );
        }

        // Update protection_details if provided
        await connection.query('DELETE FROM protection_details WHERE clientId = ?', [id]);
        if (merged.productDetails?.protection) {
            const p = merged.productDetails.protection;
            await connection.query(
                `INSERT INTO protection_details 
                 (clientId, typeOfInsurance, provider, providerReference, amountAssured, term, premium, dateOnRisk, commission, advisor) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, p.typeOfInsurance || '', p.provider || '', p.providerReference || '', p.amountAssured || 0, p.term || '', p.premium || 0, p.dateOnRisk || null, p.commission || 0, p.advisor || '']
            );
        }

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

export default router;