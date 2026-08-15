import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// --- Path Setup ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "db.json");

// --- Default Data Structure ---
const mockClients = [
  {
    id: "cli-001",
    name: "Eleanor Vance",
    email: "eleanor.v@example.com",
    phone: "555-0301",
    caseReference: "EV-2024-001",
    primaryAdvisor: "John Doe",
    admin: "Emily White",
    applicationType: "Single",
    applicants: [
      {
        title: "Mrs",
        firstName: "Eleanor",
        middleName: "Jane",
        surname: "Vance",
        gender: "Female",
        dob: "1985-05-20",
        homeTelephone: "555-0101",
        mobileNumber: "555-0301",
        email: "eleanor.v@example.com",
        currentAddress: "456 Oak Avenue, Springfield",
        noOfDependents: 2,
        nationality: "British",
      },
    ],
    property: {
      address: "456 Oak Avenue, Springfield",
      propertyValue: 750000,
      purchasePrice: 650000,
      dateOfPurchase: "2020-01-15",
      yearBuilt: 1995,
      propertyType: "Detached",
      isExLocal: false,
      bedrooms: 4,
      livingRooms: 2,
      kitchens: 1,
      bathrooms: 2,
      separateToilets: 1,
      hasGarageOrParking: true,
    },
    productDetails: {
      businessWritten: "Mortgage & Protection",
      mortgage: {
        mortgageType: "Remortgage without Capital raising",
        dateOfFMA: "2024-06-01",
        dateOffered: "2024-06-15",
        lender: "Springfield Bank",
        lenderReference: "SB-987654",
        propertyValue: 750000,
        mortgageLoanAmount: 450000,
        brokerFees: 500,
        procurationFees: 1600,
        rate: "3.15%",
        productType: "Fixed",
        productTerm: "5 years",
        rateExpiry: "2027-06-30",
        renewalReminderDate: "2027-03-30",
        mortgageTerm: "25 years",
        advisor: "John Doe",
      },
      protection: {
        typeOfInsurance: "Level term",
        provider: "SecureLife Co.",
        providerReference: "SL-123456",
        amountAssured: 300000,
        term: "25 years",
        premium: 35.5,
        dateOnRisk: "2024-06-20",
        commission: 450,
        advisor: "Jane Smith",
      },
      solicitor: {
        name: "James Harris",
        company: "Harris & Co Legal",
        email: "j.harris.law@example.com",
        phone: "555-0201",
      },
      estateAgent: {
        companyName: "Springfield Realty",
        personDealingWith: "Sarah Connor",
        address: "123 Main St, Springfield",
        phone: "555-0401",
      },
    },
    documents: [
      {
        id: "doc-001",
        fileName: "Passport_Scan_EV.pdf",
        fileType: "pdf",
        uploadDate: "2024-05-12",
        url: "#",
      },
      {
        id: "doc-002",
        fileName: "Proof_of_Address.jpeg",
        fileType: "jpeg",
        uploadDate: "2024-05-12",
        url: "#",
      },
    ],
    notes: [
      {
        id: "note-001",
        text: "Client is keen to complete by the end of August. Followed up with solicitor.",
        author: "John Doe",
        date: "2024-07-18",
      },
    ],
    status: "Active",
    caseStatus: "Renewal",
    lastContacted: "2024-07-15",
    avatar: "https://picsum.photos/seed/eleanor/100/100",
    createdDate: "2024-05-10",
    product: { type: "Mortgage & Protection" },
    value: 450000,
  },
  {
    id: "cli-002",
    name: "Marcus Thorne",
    email: "marcus.t@example.com",
    phone: "555-0302",
    caseReference: "MT-2024-002",
    primaryAdvisor: "Jane Smith",
    admin: "Emily White",
    applicationType: "Joint",
    applicants: [
      {
        title: "Mr",
        firstName: "Marcus",
        middleName: "James",
        surname: "Thorne",
        gender: "Male",
        dob: "1992-11-30",
        homeTelephone: "555-0102",
        mobileNumber: "555-0302",
        email: "marcus.t@example.com",
        currentAddress: "789 Pine Street, Gotham",
        noOfDependents: 0,
        nationality: "American",
      },
      {
        title: "Mrs",
        firstName: "Eleanor",
        middleName: "Jane",
        surname: "Thorne",
        gender: "Female",
        dob: "1985-05-20",
        homeTelephone: "555-0101",
        mobileNumber: "555-0301",
        email: "eleanor.t@example.com",
        currentAddress: "789 Pine Street, Gotham",
        noOfDependents: 0,
        nationality: "British",
      },
    ],
    property: {
      address: "789 Pine Street, Gotham",
      propertyValue: 420000,
      purchasePrice: 400000,
      dateOfPurchase: "2023-08-01",
      yearBuilt: 2010,
      propertyType: "Flat",
      isExLocal: false,
      bedrooms: 2,
      livingRooms: 1,
      kitchens: 1,
      bathrooms: 1,
      separateToilets: 0,
      hasGarageOrParking: true,
    },
    productDetails: {
      businessWritten: "Mortgage Only",
      mortgage: {
        mortgageType: "Purchase",
        dateOfFMA: "2023-07-20",
        dateOffered: "2023-08-01",
        lender: "Gotham Financial",
        lenderReference: "GF-555111",
        propertyValue: 420000,
        mortgageLoanAmount: 380000,
        brokerFees: 0,
        procurationFees: 1200,
        rate: "4.20%",
        productType: "Variable",
        productTerm: "2 years",
        rateExpiry: "2025-08-15",
        renewalReminderDate: "2025-05-15",
        mortgageTerm: "30 years",
        advisor: "Jane Smith",
      },
    },
    documents: [],
    status: "Lead",
    caseStatus: "Initial Enquiry",
    lastContacted: "2024-08-01",
    avatar: "https://picsum.photos/seed/marcus/100/100",
    createdDate: "2024-08-01",
    product: { type: "First-Time Buyer Mortgage" },
    value: 380000,
  },
];

const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const mockTasks = [
  {
    id: "task-001",
    title: "Follow up with Eleanor Vance re: renewal docs",
    description: "Client needs to sign and return the renewal pack.",
    dueDate: "2024-09-15",
    status: "AIP",
    assignedTo: "John Doe",
    assignedBy: "John Doe",
    clientId: "cli-001",
  },
  {
    id: "task-002",
    title: "Prepare initial illustration for Marcus Thorne",
    description: "Generate illustration based on 2-year fixed rate at 3.5%.",
    dueDate: "2024-09-20",
    status: "Enquiry",
    assignedTo: "Jane Smith",
    assignedBy: "Jane Smith",
    clientId: "cli-002",
  },
  {
    id: "task-f07",
    title: "Chase solicitor for Thorne case",
    dueDate: getFutureDate(12),
    status: "Offered",
    assignedTo: "Emily White",
    assignedBy: "Jane Smith",
    clientId: "cli-002",
  },
  {
    id: "task-f10",
    title: "Prepare for team meeting",
    dueDate: getFutureDate(18),
    status: "AIP",
    assignedTo: "Super Admin",
    assignedBy: "System",
  },
];

const mockContacts = [
  {
    id: "con-001",
    name: "James Harris",
    type: "Solicitor",
    email: "j.harris.law@example.com",
    phone: "555-0201",
    company: "Harris & Co Legal",
  },
  {
    id: "con-002",
    name: "Sophia Chen",
    type: "Accountant",
    email: "sophia.c@acmeaccounting.com",
    phone: "555-0202",
    company: "Acme Accounting",
  },
];

const mockPasswords = [
  {
    id: "pwd-001",
    ownerId: "team-3",
    service: "First National Bank Portal",
    accessLink: "https://online.fnb-portal.com",
    username: "john.doe.fnb",
    password: "password123",
    memorablePhrase: "Blue Dog",
    securityQuestions: [
      { id: "sq-1-1", question: "First pet's name?", answer: "Buddy" },
    ],
  },
  {
    id: "pwd-002",
    ownerId: "team-4",
    service: "Metropolis Mortgage Hub",
    accessLink: "https://broker.metropolismortgage.com",
    username: "jane.smith@amp.co.uk",
    password: "password123",
    memorablePhrase: "Green Tree",
    securityQuestions: [],
  },
];

const mockLedger = [
  {
    id: "led-001",
    date: "2024-07-20",
    clientName: "Eleanor Vance",
    description: "Mortgage Commission",
    amount: 3500,
    type: "Commission",
  },
  {
    id: "led-002",
    date: "2024-07-22",
    clientName: "-",
    description: "Office Software Subscription",
    amount: -150,
    type: "Expense",
  },
];

const mockProposals = [
  {
    id: "prop-1",
    clientName: "Eleanor Vance",
    product: "Mortgage Renewal",
    status: "Accepted",
    sentDate: "2024-07-10",
    value: 450000,
  },
  {
    id: "prop-2",
    clientName: "Marcus Thorne",
    product: "First-Time Buyer Mortgage",
    status: "Sent",
    sentDate: "2024-08-02",
    value: 380000,
  },
];

const mockEmailTemplates = [
  {
    id: "tmpl-1",
    name: "Initial Welcome",
    subject: "Welcome to Advance Mortgages & Protection",
    lastUpdated: "2024-07-20",
  },
  {
    id: "tmpl-2",
    name: "Document Request",
    subject: "Required Documents for Your Application",
    lastUpdated: "2024-06-15",
  },
];

const mockTeam = [
  {
    id: "team-1",
    name: "Super Admin",
    role: "Super Admin",
    email: "super@example.com",
    avatar: "https://picsum.photos/seed/super/100/100",
    password: "password123",
  },
  {
    id: "team-2",
    name: "Emily White",
    role: "Admin",
    email: "emily.w@example.com",
    avatar: "https://picsum.photos/seed/emily/100/100",
    password: "password123",
  },
  {
    id: "team-5",
    name: "Michael Brown",
    role: "Admin",
    email: "michael.b@example.com",
    avatar: "https://picsum.photos/seed/michael/100/100",
    password: "password123",
  },
  {
    id: "team-3",
    name: "John Doe",
    role: "Adviser",
    email: "john.d@example.com",
    avatar: "https://picsum.photos/seed/john/100/100",
    password: "password123",
  },
  {
    id: "team-4",
    name: "Jane Smith",
    role: "Adviser",
    email: "jane.s@example.com",
    avatar: "https://picsum.photos/seed/jane/100/100",
    password: "password123",
  },
];

// --- Database Setup (Fixed for Lowdb v7+) ---
const adapter = new JSONFile(file);
const defaultData = {
  clients: mockClients,
  tasks: mockTasks,
  contacts: mockContacts,
  passwords: mockPasswords,
  ledger: mockLedger,
  proposals: mockProposals,
  email_templates: mockEmailTemplates,
  team: mockTeam,
};

const db = new Low(adapter, defaultData);

export const initializeDatabase = async () => {
  await db.read();

  // If file doesn't exist or is empty, db.data falls back to defaultData
  if (!db.data || !db.data.team || db.data.team.length === 0) {
    db.data = defaultData;
  }

  let needsWrite = false;

  // Hash team passwords if they are plain text
  if (
    db.data.team &&
    db.data.team[0] &&
    db.data.team[0].password &&
    !db.data.team[0].password.startsWith("$2a")
  ) {
    console.log("Unhashed team passwords detected. Hashing...");
    needsWrite = true;
    db.data.team = db.data.team.map((user) => {
      const salt = bcrypt.genSaltSync(10);
      return { ...user, password: bcrypt.hashSync(user.password, salt) };
    });
  }

  // Hash password records if unhashed
  if (db.data.passwords) {
    db.data.passwords.forEach((entry) => {
      const salt = bcrypt.genSaltSync(10);
      if (entry.password && !entry.password.startsWith("$2a")) {
        entry.password = bcrypt.hashSync(entry.password, salt);
        needsWrite = true;
      }
      if (entry.memorablePhrase && !entry.memorablePhrase.startsWith("$2a")) {
        entry.memorablePhrase = bcrypt.hashSync(entry.memorablePhrase, salt);
        needsWrite = true;
      }
      if (entry.securityQuestions) {
        entry.securityQuestions.forEach((sq) => {
          if (sq.answer && !sq.answer.startsWith("$2a")) {
            sq.answer = bcrypt.hashSync(sq.answer, salt);
            needsWrite = true;
          }
        });
      }
    });
  }
  if (needsWrite || !db.data) {
    await db.write();
    console.log("Database initialized, passwords hashed, and saved.");
  } else {
    console.log("Database loaded successfully.");
  }
};

export { db };
