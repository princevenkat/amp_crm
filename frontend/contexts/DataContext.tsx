import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { DataContextType, ContactType, Client, Task, Contact, Proposal, EmailTemplate, LedgerEntry, PasswordEntry, TeamMember } from '../types';
import { View } from '../types';
import * as api from '../services/apiService';

export const DataContext = createContext<DataContextType>(null!);

// Map fee labels → LedgerEntry.type
const feeTypeMap: Record<string, LedgerEntry["type"]> = {
    "Broker Fee": "Broker Fee",
    "Arrangement Fee": "Fee",
    "Valuation Fee": "Fee",
    "Procuration Fee": "Procuration Fee",
    "Referral Fee": "Referral Fee",
    "Other": "Other"
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Master data lists
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);







    // Auth and loading state
    const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);

    // State for navigation
    // const [currentView, setCurrentView] = useState<View>(View.Dashboard);

    const [currentViewState, setCurrentViewState] = useState<View>(() => {
        const savedView = localStorage.getItem('currentView');
        return (savedView as View) || View.Dashboard;
    });

    const setCurrentView = (view: View) => {
        setCurrentViewState(view);
        localStorage.setItem('currentView', view);
    };


    const [selectedClientIdForNav, setSelectedClientIdForNav] = useState<string | null>(null);
    const [selectedTaskIdForNav, setSelectedTaskIdForNav] = useState<string | null>(null);

    const fetchAllData = async () => {
        try {
            // Fetch all data from the backend concurrently for better performance
            const [
                clientsData,
                tasksData,
                contactsData,
                proposalsData,
                emailTemplatesData,
                ledgerData,
                passwordsData,
                teamMembersData,
            ] = await Promise.all([
                api.getClients(),
                api.getTasks(),
                api.getContacts(),
                api.getProposals(),
                api.getEmailTemplates(),
                api.getLedger(),
                api.getPasswords(),
                api.getTeamMembers(),
            ]);

            setClients(clientsData || []);
            setTasks(tasksData || []);
            setContacts(contactsData || []);
            setProposals(proposalsData || []);
            setEmailTemplates(emailTemplatesData || []);
            setLedger(ledgerData || []);
            setPasswords(passwordsData || []);
            setTeamMembers(teamMembersData || []);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // If any data fetch fails, it's better to log out to avoid a broken state.
            logout();
        }
    };

    // Check for existing session on initial load
    useEffect(() => {
        const checkSession = async () => {
            const token = api.getAuthToken();
            if (token) {
                try {
                    const user = await api.getMe();
                    setCurrentUser(user);
                    await fetchAllData();
                } catch (error) {
                    console.error("Session check failed:", error);
                    api.clearAuthToken(); // Clear invalid token
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);


    // Auth functions
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { user, token } = await api.login(email, password);
            api.setAuthToken(token);
            setCurrentUser(user);
            setLoading(true);
            await fetchAllData();
            setCurrentView(View.Dashboard);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    // const logout = () => {
    //     api.clearAuthToken();
    //     setCurrentUser(null);
    //     setClients([]);
    //     setTasks([]);
    //     setContacts([]);
    //     setProposals([]);
    //     setEmailTemplates([]);
    //     setLedger([]);
    //     setPasswords([]);
    //     setTeamMembers([]);
    // };
    const logout = () => {
        api.clearAuthToken();
        localStorage.removeItem('currentView'); // 👈 clear stored view
        setCurrentUser(null);
        setClients([]);
        setTasks([]);
        setContacts([]);
        setProposals([]);
        setEmailTemplates([]);
        setLedger([]);
        setPasswords([]);
        setTeamMembers([]);
    };


    const updateMyPassword = async (data: { currentPassword: string, newPassword: string }) => {
        try {
            const response = await api.updateMyPassword(data);
            return { success: true, message: response.message };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error("Password update failed:", message);
            return { success: false, message };
        }
    };


    // CRUD operations
    const addClient = async (client: Omit<Client, 'id' | 'avatar'>) => {
        const newClient = await api.createClient(client);
        setClients(prev => [newClient, ...prev]);
    };

    // const updateClient = async (clientId: string, updatedData: Partial<Client>) => {
    //     const updatedClient = await api.updateClient(clientId, updatedData);
    //     setClients(prev =>
    //         prev.map(client =>
    //             client.id === clientId ? updatedClient : client
    //         )
    //     );
    // };

    const updateClient = async (clientId: string, updatedData: Partial<Client>) => {
        // 🧹 Remove undefined, null, and empty objects/arrays
        const cleanedPayload = Object.fromEntries(
            Object.entries(updatedData).filter(([_, v]) => {
                if (v === undefined || v === null) return false;
                if (Array.isArray(v) && v.length === 0) return false;
                if (typeof v === "object" && Object.keys(v).length === 0) return false;
                return true;
            })
        );

        console.log("🧼 Cleaned payload being sent:", cleanedPayload);

        const updatedClient = await api.updateClient(clientId, cleanedPayload);

        setClients(prev =>
            prev.map(client => (client.id === clientId ? updatedClient : client))
        );
    };


    // const deleteClient = async (clientId: string): Promise<boolean> => {
    //     if (window.confirm('Are you sure you want to delete this client?')) {
    //         await api.deleteClient(clientId);
    //         setClients(prev => prev.filter(client => client.id !== clientId));
    //         return true;
    //     }
    //     return false;
    // };


    const deleteClient = async (clientId: string): Promise<boolean> => {
        // Remove the window.confirm here, as the parent component already handles the confirmation.
        await api.deleteClient(clientId);
        setClients(prev => prev.filter(client => client.id !== clientId));
        return true;
    };




    const addTask = async (task: Omit<Task, 'id'>) => {
        const newTask = await api.createTask(task);
        setTasks(prev => [newTask, ...prev]);
    };

    const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
        const updatedTask = await api.updateTask(taskId, updatedData);
        setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    };

    const deleteTask = async (taskId: string): Promise<boolean> => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await api.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            return true;
        }
        return false;
    };

    const addContact = async (contact: Omit<Contact, 'id'>) => {
        const newContact = await api.createContact(contact);
        setContacts(prev => [newContact, ...prev]);
    };

    const updateContact = async (contactId: string, updatedData: Partial<Contact>) => {
        const updatedContact = await api.updateContact(contactId, updatedData);
        setContacts(prev => prev.map(contact => contact.id === contactId ? updatedContact : contact));
    };




    // Add this helper to the value: DataContextType (or below your functions)

    // const getContactsByType = (type: string) => {
    //     return contacts.filter(c => c.type === type);
    // };
    const getContactsByType = (type: ContactType) => {
        return contacts.filter((c) => c.type === type);
    };

    const deleteContact = async (contactId: string): Promise<boolean> => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            await api.deleteContact(contactId);
            setContacts(prev => prev.filter(contact => contact.id !== contactId));
            return true;
        }
        return false;
    };


    // const addProposal = async (proposal: Omit<Proposal, 'id'>) => {
    //     const newProposal = await api.createProposal(proposal);
    //     setProposals(prev => [newProposal, ...prev]);
    // };

    // Proposals CRUD
    const addProposal = async (proposal: Omit<Proposal, 'id'>) => {
        const newProposal = await api.createProposal(proposal);
        setProposals(prev => [newProposal, ...prev]);
    };

    const updateProposal = async (proposal: Proposal) => {
        const updated = await api.updateProposal(proposal);
        setProposals(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    };

    const deleteProposal = async (proposalId: string) => {
        if (window.confirm('Are you sure you want to delete this proposal?')) {
            await api.deleteProposal(proposalId);
            setProposals(prev => prev.filter(p => p.id !== proposalId));
        }
    };

    const addEmailTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
        const newTemplate = await api.createEmailTemplate(template);
        setEmailTemplates(prev => [newTemplate, ...prev]);
    };

    const addTeamMember = async (member: Omit<TeamMember, 'id' | 'avatar'>) => {
        const newMember = await api.createTeamMember(member);
        setTeamMembers(prev => [newMember, ...prev]);
    };

    const updateTeamMember = async (memberId: string, updatedData: Partial<TeamMember>) => {
        const updatedMember = await api.updateTeamMember(memberId, updatedData);
        setTeamMembers(prev =>
            prev.map(member =>
                member.id === memberId ? updatedMember : member
            )
        );
    };

    const deleteTeamMember = async (memberId: string): Promise<boolean> => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            await api.deleteTeamMember(memberId);
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            return true;
        }
        return false;
    };

    const addPasswordEntry = async (entry: Omit<PasswordEntry, 'id'>) => {
        const newEntry = await api.createPasswordEntry(entry);
        setPasswords(prev => [newEntry, ...prev]);
    };

    const updatePasswordEntry = async (entryId: string, updatedData: Partial<PasswordEntry>) => {
        const updatedEntry = await api.updatePasswordEntry(entryId, updatedData);
        setPasswords(prev => prev.map(entry => entry.id === entryId ? updatedEntry : entry));
    };

    const deletePasswordEntry = async (entryId: string): Promise<boolean> => {
        if (window.confirm('Are you sure you want to delete this password entry?')) {
            await api.deletePasswordEntry(entryId);
            setPasswords(prev => prev.filter(entry => entry.id !== entryId));
            return true;
        }
        return false;
    };

    const addLedgerEntry = async (entry: Omit<LedgerEntry, 'id'>) => {
        const newEntry = await api.createLedgerEntry(entry);
        setLedger(prev => [newEntry, ...prev]);
    };

    const updateLedgerEntry = async (entryId: string, updatedData: Partial<LedgerEntry>) => {
        const updatedEntry = await api.updateLedgerEntry(entryId, updatedData);
        setLedger(prev => prev.map(entry => entry.id === entryId ? updatedEntry : entry));
    };

    const deleteLedgerEntry = async (entryId: string): Promise<boolean> => {
        if (window.confirm('Are you sure you want to delete this ledger entry?')) {
            await api.deleteLedgerEntry(entryId);
            setLedger(prev => prev.filter(entry => entry.id !== entryId));
            return true;
        }
        return false;
    };



    // 🔵 NEW — global contact modal state
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactModalData, setContactModalData] = useState<Contact | null>(null);

    const openContactModal = (contact?: Contact) => {
        setContactModalData(contact || null);
        setContactModalOpen(true);
    };

    const closeContactModal = () => {
        setContactModalOpen(false);
        setContactModalData(null);
    };



    const value: DataContextType = {
        clients,
        addClient,
        updateClient,
        deleteClient,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getContactsByType,
        proposals,
        addProposal,
        updateProposal,
        deleteProposal,
        emailTemplates,
        addEmailTemplate,
        ledger,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        passwords,
        addPasswordEntry,
        updatePasswordEntry,
        deletePasswordEntry,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        currentView: currentViewState,
        setCurrentView,
        selectedClientIdForNav,
        setSelectedClientIdForNav,
        selectedTaskIdForNav,
        setSelectedTaskIdForNav,
        currentUser,
        login,
        logout,
        updateMyPassword,
        loading,
        openContactModal,
        closeContactModal,
        contactModalOpen,
        contactModalData,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

