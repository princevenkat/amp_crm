import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: "1.5",
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const DashboardIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M14 14h6v6h-6z" /></svg>;
export const LeadsIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>;
export const TasksIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3.5 5.5l1.5 1.5l2.5 -2.5" /><path d="M3.5 11.5l1.5 1.5l2.5 -2.5" /><path d="M3.5 17.5l1.5 1.5l2.5 -2.5" /><path d="M11 6l9 0" /><path d="M11 12l9 0" /><path d="M11 18l9 0" /></svg>;
export const ContactsIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 6v12a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2z" /><path d="M10 16h6" /><path d="M13 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 8h3" /><path d="M4 12h3" /><path d="M4 16h3" /></svg>;
export const SettingsIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>;
export const AiIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 16v-6a2 2 0 1 1 4 0v6" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M10 9.5v-2.5a2 2 0 1 1 4 0v2.5" /><path d="M7 9h10" /><path d="M10 18.5a1.5 1.5 0 0 1 3 0" /></svg>;
export const DealsIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" /><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" /></svg>;
export const CalendarIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /></svg>;
export const EmailTemplatesIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 19h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5.5" /><path d="M19 16v6" /><path d="M22 19l-3 3l-3 -3" /><path d="M3 7l9 6l9 -6" /></svg>;
export const ProposalsIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 7h1" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>;
export const TeamIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" /><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M17 10h2a2 2 0 0 1 2 2v1" /><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M3 13v-1a2 2 0 0 1 2 -2h2" /></svg>;
export const PasswordManagerIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 10a2 2 0 1 0 -4 0a2 2 0 0 0 4 0" /><path d="M9.5 10a2.5 2.5 0 1 1 5 0" /><path d="M12 12.5v8.5" /><path d="M10 16l4 0" /><path d="M10 20l4 0" /><path d="M12 12.5a5.5 5.5 0 0 1 -4.84 -8.01a5.5 5.5 0 0 1 9.68 0a5.5 5.5 0 0 1 -4.84 8.01z" /></svg>;
export const BusinessLedgerIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-11a1 1 0 0 1 1 -1h3" /><path d="M10 16h4" /><path d="M11 11h2" /><path d="M12 3v4" /><path d="M10 5h4" /></svg>;
export const NotificationIcon = <svg {...iconProps} className="w-6 h-6"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>;
export const ChevronDownIcon = <svg {...iconProps} className="w-4 h-4"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 9l6 6l6 -6" /></svg>;
export const ChevronLeftIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>;
export const ChevronRightIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>;
export const SearchIcon = <svg {...iconProps} className="w-5 h-5 text-gray-400"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>;
export const CloseIcon = <svg {...iconProps} className="w-6 h-6"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>;
export const LoadingIcon = <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
export const PlusIcon = <svg {...iconProps} className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>;
export const MinusIcon = <svg {...iconProps} className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l14 0" /></svg>;
export const EditIcon = <svg {...iconProps} className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg>;
export const LogOutIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>;
export const EyeIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.2 4 -5.2 6 -9 6s-6.8 -2 -9 -6c2.2 -4 5.2 -6 9 -6s6.8 2 9 6" /></svg>;
export const EyeOffIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.8 0 -6.8 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.8 0 6.8 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>;
export const MenuIcon = <svg {...iconProps} className="w-6 h-6"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>;
export const LinkIcon = <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>;
export const DeleteIcon = (
  <svg {...iconProps} className="w-6 h-6">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6" />
    <path d="M15 9l-6 6" />
  </svg>
);
