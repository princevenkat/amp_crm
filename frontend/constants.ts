import { View } from "./types";
import type { ReactNode } from "react";
import {
  DashboardIcon,
  LeadsIcon,
  ContactsIcon,
  DealsIcon,
  TasksIcon,
  CalendarIcon,
  TeamIcon,
  SettingsIcon,
  PasswordManagerIcon,
  BusinessLedgerIcon,
  ProposalsIcon,
  EmailTemplatesIcon,
  AiIcon,
} from "./components/ui/Icons";

export interface NavItem {
  id: View;
  label: string;
  icon: ReactNode;
}

export const NAV_SECTIONS: NavItem[][] = [
  [
    { id: View.Dashboard, label: "Dashboard", icon: DashboardIcon },
    { id: View.Deals, label: "Pipeline", icon: DealsIcon },
    { id: View.Leads, label: "Clients", icon: LeadsIcon },
    {
      id: View.ArchiveCompleted,
      label: "Completed / Archvie Clients",
      icon: LeadsIcon,
    },
    { id: View.Contacts, label: "Contacts", icon: ContactsIcon },
    { id: View.Tasks, label: "Tasks", icon: TasksIcon },
    { id: View.Appointment, label: "Appointments", icon: ProposalsIcon },
    { id: View.Calendar, label: "Calendar", icon: CalendarIcon },
    { id: View.Proposals, label: "Proposals", icon: ProposalsIcon },
    // {
    //   id: View.EmailTemplates,
    //   label: "Email Templates",
    //   icon: EmailTemplatesIcon,
    // },
  ],
  [
    {
      id: View.BusinessLedger,
      label: "Business Ledger",
      icon: BusinessLedgerIcon,
    },
    {
      id: View.PasswordManager,
      label: "Password Manager",
      icon: PasswordManagerIcon,
    },
    // { id: View.AiAssistant, label: "AI Assistant", icon: AiIcon },
    { id: View.Team, label: "Team", icon: TeamIcon },
    { id: View.Settings, label: "Settings", icon: SettingsIcon },
  ],
];

export const businessWrittenDisplayMap: Record<string, string> = {
  "Mortgage Only": "Mortgage Only",
  "Protection Only": "Protection Only",
  "Building & Content": "Bridge Loan",
  "Mortgage & Protection": "Commercial Loan",
};
