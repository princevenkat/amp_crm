export enum View {
  Dashboard = "Dashboard",
  Leads = "Leads",
  Contacts = "Contacts",
  Deals = "Deals",
  Tasks = "Tasks",
  Calendar = "Calendar",
  EmailTemplates = "EmailTemplates",
  Proposals = "Proposals",
  AiAssistant = "AiAssistant",
  Team = "Team",
  Settings = "Settings",
  PasswordManager = "PasswordManager",
  BusinessLedger = "BusinessLedger",
}

export enum TaskStatus {
  Enquiry = "Enquiry",
  AIP = "AIP",
  FMA = "FMA",
  Offered = "Offered",
  Completed = "Completed",
  CommissionDue = "Commission Due",
  NPW = "NPW",
}

export enum ContactType {
  Lender = "Lender",
  Solicitor = "Solicitor",
  Accountant = "Accountant",
  Surveyor = "Surveyor",
  Other = "Other",
}

export interface Applicant {
  title: string;
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  dob: string;
  homeTelephone: string;
  mobileNumber: string;
  email: string;
  currentAddress: string;
  noOfDependents: number;
  nationality: string;
}

export interface PropertyDetails {
  address: string;
  propertyValue: number;
  purchasePrice: number;
  dateOfPurchase: string;
  yearBuilt: number | string;
  propertyType: "Detached" | "Semi-detached" | "Terraced" | "Flat" | "";
  isExLocal: boolean;
  bedrooms: number | string;
  livingRooms: number | string;
  kitchens: number | string;
  bathrooms: number | string;
  separateToilets: number | string;
  flatsInBlock?: number | string;
  storeysInBlock?: number | string;
  floorOfFlat?: number | string;
  leaseRemaining?: number | string;
  groundRent?: number | string;
  serviceCharge?: number | string;
  hasGarageOrParking: boolean;
}

// --- NEW Product Details Interfaces ---

export type BusinessWrittenType =
  | "Mortgage Only"
  | "Protection Only"
  | "Building & Content"
  | "Mortgage & Protection"
  | "";

export interface MortgageDetails {
  mortgageType:
    | "Purchase"
    | "Remortgage with capital raising"
    | "Remortgage without Capital raising"
    | "Product switch"
    | "Further Advance"
    | "";
  dateOfFMA: string;
  dateOffered: string;
  lender: string;
  lenderReference: string;
  propertyValue: number;
  mortgageLoanAmount: number;
  brokerFees: number;
  procurationFees: number;
  rate: string;
  productType: "Fixed" | "Variable" | "Discount" | "Capped" | "";
  productTerm: string; // e.g., "2 years"
  rateExpiry: string;
  renewalReminderDate: string;
  mortgageTerm: string; // e.g., "25 years"
  advisor?: string;
}

export interface ProtectionDetails {
  typeOfInsurance:
    | "Level term"
    | "Decreasing term"
    | "Increasing term"
    | "CIC"
    | "Income protection"
    | "FIB"
    | "";
  provider: string;
  providerReference: string;
  amountAssured: number;
  term: string; // e.g. "25 years"
  premium: number;
  dateOnRisk: string;
  commission: number;
  advisor?: string;
}

export interface ProfessionalContact {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export interface EstateAgentContact {
  companyName: string;
  personDealingWith: string;
  address: string;
  phone: string;
}

export interface LimitedCompanyDetails {
  name: string;
  registrationNumber: string;
  address: string;
  directors: string[];
  dateEstablished: string;
  phone: string;
  email: string;
}

export interface ProductDetails {
  businessWritten: BusinessWrittenType;
  mortgage?: MortgageDetails;
  protection?: ProtectionDetails;
  solicitor?: ProfessionalContact;
  accountant?: ProfessionalContact;
  surveyor?: ProfessionalContact;
  estateAgent?: EstateAgentContact;
  limitedCompany?: LimitedCompanyDetails;
}

// --- NEW Document Interface ---
export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  // In a real app, this would be a URL to the file
  url: string;
}

export interface Note {
  id: string;
  text: string;
  author: string;
  date: string;
}

export type CaseStatus =
  | "Initial Enquiry"
  | "AIP"
  | "FMA Submitted"
  | "Offered"
  | "Completed"
  | "Renewal"
  | "";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  // Optional fields that exist in DB but not always set
  dateOfPurchase?: string | null;
  yearBuilt?: number | null;
  propertyValue?: number | null;
  purchasePrice?: number | null;

  // Core new data structure
  caseReference: string;
  primaryAdvisor: string;
  admin: string;
  applicationType: "Single" | "Joint";
  applicants: Applicant[];
  property: PropertyDetails;
  productDetails?: ProductDetails;
  documents?: Document[];
  notes?: Note[];

  // Existing fields
  status: "Active" | "Lead" | "Archived";
  caseStatus?: CaseStatus;
  lastContacted: string;
  avatar: string;
  createdDate: string;
  value?: number; // Potential value of the deal/lead

  // Simplified for compatibility with client list view
  product: {
    type: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  assignedBy: string;
  clientId?: string;
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  company: string;
}

// FIX: Added the 'Deal' interface to resolve an import error in NewDealForm.tsx.
export interface Deal {
  id: string;
  title: string;
  clientId: string;
  value: number;
  stage: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface PasswordEntry {
  id: string;
  ownerId: string; // ID of the TeamMember who owns this entry
  service: string; // Name of Lender/Provider
  accessLink: string;
  username: string;
  password?: string; // Stored encrypted in a real app, optional here for reveal logic
  memorablePhrase?: string; // Optional for reveal logic
  securityQuestions: SecurityQuestion[];
}

export interface LedgerEntry {
  id: string;
  date: string;
  clientName: string;
  description: string;
  amount: number;
  type: "Commission" | "Fee" | "Expense";
}

export interface Proposal {
  id: string;
  clientName: string;
  product: string;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
  sentDate: string;
  value: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  lastUpdated: string;
}

export enum UserRole {
  SuperAdmin = "Super Admin",
  Admin = "Admin",
  Adviser = "Adviser",
}

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  password?: string;
}

export interface DataContextType {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "avatar">) => Promise<void>;
  updateClient: (
    clientId: string,
    updatedData: Partial<Client>
  ) => Promise<void>;
  deleteClient: (clientId: string) => Promise<boolean>;
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (taskId: string, updatedData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<boolean>;
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id">) => Promise<void>;
  updateContact: (
    contactId: string,
    updatedData: Partial<Contact>
  ) => Promise<void>;
  deleteContact: (contactId: string) => Promise<boolean>;
  proposals: Proposal[];
  addProposal: (proposal: Omit<Proposal, "id">) => Promise<void>;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, "id">) => Promise<void>;
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id">) => Promise<void>;
  updateLedgerEntry: (
    entryId: string,
    updatedData: Partial<LedgerEntry>
  ) => Promise<void>;
  deleteLedgerEntry: (entryId: string) => Promise<boolean>;
  passwords: PasswordEntry[];
  addPasswordEntry: (entry: Omit<PasswordEntry, "id">) => Promise<void>;
  updatePasswordEntry: (
    entryId: string,
    updatedData: Partial<PasswordEntry>
  ) => Promise<void>;
  deletePasswordEntry: (entryId: string) => Promise<boolean>;
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, "id" | "avatar">) => Promise<void>;
  updateTeamMember: (
    memberId: string,
    updatedData: Partial<TeamMember>
  ) => Promise<void>;
  deleteTeamMember: (memberId: string) => Promise<boolean>;
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedClientIdForNav: string | null;
  setSelectedClientIdForNav: (clientId: string | null) => void;
  selectedTaskIdForNav: string | null;
  setSelectedTaskIdForNav: (taskId: string | null) => void;
  currentUser: TeamMember | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateMyPassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}
