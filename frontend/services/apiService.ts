import type {
  Client,
  Task,
  Contact,
  Proposal,
  EmailTemplate,
  LedgerEntry,
  PasswordEntry,
  TeamMember,
  Appointment,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"; // In a real app, use environment variables

// --- Auth Token Management ---
let authToken: string | null = localStorage.getItem("authToken");

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
};

// --- API Request Helper ---
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unknown API error occurred." }));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

// --- API Methods ---

// Auth
export const login = (email: string, password: string) =>
  apiRequest<{ user: TeamMember; token: string }>("/auth/login", "POST", {
    email,
    password,
  });
export const getMe = () => apiRequest<TeamMember>("/auth/me");

// ✅ Add this:
export const updateMyPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => apiRequest<{ message: string }>("/auth/password", "POST", data);

// Clients
export const getClients = () => apiRequest<Client[]>("/clients");
export const createClient = (data: Omit<Client, "id" | "avatar">) =>
  apiRequest<Client>("/clients", "POST", data);
export const updateClient = (id: string, data: Partial<Client>) =>
  apiRequest<Client>(`/clients/${id}`, "PUT", data);
export const deleteClient = (id: string) =>
  apiRequest<void>(`/clients/${id}`, "DELETE");

// --- Case Worker (inside Clients module) ---
export const updateCaseWorker = (
  id: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    reference?: string;
    profession?: string;
  }
) => apiRequest<Client>(`/clients/${id}/caseworker`, "PUT", data);

// Tasks
export const getTasks = () => apiRequest<Task[]>("/tasks");
export const createTask = (data: Omit<Task, "id">) =>
  apiRequest<Task>("/tasks", "POST", data);
export const updateTask = (id: string, data: Partial<Task>) =>
  apiRequest<Task>(`/tasks/${id}`, "PUT", data);
export const deleteTask = (id: string) =>
  apiRequest<void>(`/tasks/${id}`, "DELETE");

// Contacts
export const getContacts = () => apiRequest<Contact[]>("/contacts");
export const createContact = (data: Omit<Contact, "id">) =>
  apiRequest<Contact>("/contacts", "POST", data);
export const updateContact = (id: string, data: Partial<Contact>) =>
  apiRequest<Contact>(`/contacts/${id}`, "PUT", data);
export const deleteContact = (id: string) =>
  apiRequest<void>(`/contacts/${id}`, "DELETE");

// Team Members
export const getTeamMembers = () => apiRequest<TeamMember[]>("/team");
export const createTeamMember = (data: Omit<TeamMember, "id" | "avatar">) =>
  apiRequest<TeamMember>("/team", "POST", data);
export const updateTeamMember = (id: string, data: Partial<TeamMember>) =>
  apiRequest<TeamMember>(`/team/${id}`, "PUT", data);
export const deleteTeamMember = (id: string) =>
  apiRequest<void>(`/team/${id}`, "DELETE");

// Passwords
// export const getPasswords = () => apiRequest<PasswordEntry[]>("/passwords");

export const getPasswords = (ownerId?: string) => {
  const query = ownerId ? `?ownerId=${ownerId}` : "";
  return apiRequest<PasswordEntry[]>(`/passwords${query}`);
};

export const createPasswordEntry = (data: Omit<PasswordEntry, "id">) =>
  apiRequest<PasswordEntry>("/passwords", "POST", data);
export const updatePasswordEntry = (id: string, data: Partial<PasswordEntry>) =>
  apiRequest<PasswordEntry>(`/passwords/${id}`, "PUT", data);
export const deletePasswordEntry = (id: string) =>
  apiRequest<void>(`/passwords/${id}`, "DELETE");

// // Proposals
// export const getProposals = () => apiRequest<Proposal[]>("/proposals");
// export const createProposal = (data: Omit<Proposal, "id">) =>
//   apiRequest<Proposal>("/proposals", "POST", data);

// Proposals
export const getProposals = () => apiRequest<Proposal[]>("/proposals");
export const createProposal = (data: Omit<Proposal, "id">) =>
  apiRequest<Proposal>("/proposals", "POST", data);
export const updateProposal = (proposal: Proposal) =>
  apiRequest<Proposal>(`/proposals/${proposal.id}`, "PUT", proposal);
export const deleteProposal = (id: string) =>
  apiRequest<void>(`/proposals/${id}`, "DELETE");

// Email Templates
export const getEmailTemplates = () =>
  apiRequest<EmailTemplate[]>("/email_templates");
export const createEmailTemplate = (data: Omit<EmailTemplate, "id">) =>
  apiRequest<EmailTemplate>("/email_templates", "POST", data);

// Ledger
export const getLedger = () => apiRequest<LedgerEntry[]>("/ledger");
export const createLedgerEntry = (data: Omit<LedgerEntry, "id">) =>
  apiRequest<LedgerEntry>("/ledger", "POST", data);
export const updateLedgerEntry = (id: string, data: Partial<LedgerEntry>) =>
  apiRequest<LedgerEntry>(`/ledger/${id}`, "PUT", data);
export const deleteLedgerEntry = (id: string) =>
  apiRequest<void>(`/ledger/${id}`, "DELETE");

// export const duplicateClient = (client: Client) => {
//   const { id, avatar, ...data } = client; // Exclude id/avatar
//   return createClient(data);
// };

// export const duplicateClient = async (client: Client) => {
//   try {
//     // Call the new backend duplicate endpoint
//     const newClient = await apiRequest<Client>(
//       `/clients/${client.id}/duplicate`,
//       "POST"
//     );

//     // Update context state
//     return newClient;
//   } catch (error) {
//     console.error("Failed to duplicate client:", error);
//     throw error;
//   }
// };
export const duplicateClient = async (clientId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/duplicate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to duplicate client");
  }

  return response.json() as Promise<{
    newClientId: string;
    newCaseReference: string;
  }>;
};

// --- API Methods ---
// Appointments
export const getAppointments = () => apiRequest<Appointment[]>("/appointments");

export const createAppointment = (data: Omit<Appointment, "id">) =>
  apiRequest<Appointment>("/appointments", "POST", data);

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  apiRequest<Appointment>(`/appointments/${id}`, "PUT", data);

export const deleteAppointment = (id: string) =>
  apiRequest<void>(`/appointments/${id}`, "DELETE");
