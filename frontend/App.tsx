import React, { useState, useCallback, Fragment, useContext, useEffect } from 'react';
import { View, UserRole } from './types';
import { NAV_SECTIONS } from './constants';
import type { NavItem } from './constants';
import { DataContext } from './contexts/DataContext';
import { toast, Toaster, ToastBar } from 'react-hot-toast';
// Import Views
import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { TasksView } from './views/TasksView';
import { ContactsView } from './views/ContactsView';
import { AdminView } from './views/AdminView';
// import { AiAssistantView } from './views/AiAssistantView';
import { DealsView } from './views/DealsView';
import { CalendarView } from './views/CalendarView';
import { EmailTemplatesView } from './views/EmailTemplatesView';
import { ProposalsView } from './views/ProposalsView';
import { TeamView } from './views/TeamView';
import { LoginView } from './views/LoginView';
import { PasswordManagerView } from './views/PasswordManagerView';
import { BusinessLedgerView } from './views/BusinessLedgerView';
import { NotFoundView } from "./views/NotFoundView";

// Import UI Components
import { ChevronDownIcon, LogOutIcon, MenuIcon } from './components/ui/Icons';
import { NotificationBell } from './components/NotificationBell';


import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResetPasswordView } from "./views/ResetPasswordView";


const ADVISER_VIEWS = [
    View.Dashboard, View.Deals, View.Leads, View.Contacts, View.Tasks, View.Calendar,
    View.PasswordManager, View.BusinessLedger, View.Settings
];
const ADMIN_VIEWS = [...ADVISER_VIEWS, View.Team];


const hasAccess = (view: View, role: UserRole): boolean => {
    if (role === UserRole.SuperAdmin) {
        return true;
    }

    switch (role) {
        case UserRole.Admin:
            return ADMIN_VIEWS.includes(view);
        case UserRole.Adviser:
            return ADVISER_VIEWS.includes(view);
        default:
            return false;
    }
};

const AccessDenied = () => (
    <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger">Access Denied</h1>
        <p className="text-text-secondary mt-2">You do not have permission to view this page.</p>
    </div>
);


const Sidebar: React.FC<{
    currentView: View;
    setView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}> = ({ currentView, setView, isOpen, setIsOpen }) => {
    const { currentUser } = useContext(DataContext);
    if (!currentUser) return null;

    const currentYear = new Date().getFullYear();
    return (
        <>

            {/*  */}
            <Toaster
                position="top-center"
                reverseOrder={false} // optional, new toasts appear below older ones
            >
                {(t) => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <>
                                {icon}
                                {message}
                                {t.type !== 'loading' && (
                                    <button onClick={() => toast.dismiss(t.id)}>X</button>
                                )}
                            </>
                        )}
                    </ToastBar>
                )}
            </Toaster>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
                }
                onClick={() => setIsOpen(false)}
                aria-hidden="true" ></div>

            {/* Sidebar */}
            < aside className={`w-64 bg-sidebar flex flex-col fixed h-full border-r border-gray-700 z-30 transform transition-transform lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center px-4 py-4 gap-3 bg-white rounded-br-2xl mb-3 ">

                    <img
                        src="/logo.png"
                        alt="Advance Mortgages & Protection Logo"
                        className="h-50 object-contain"
                    />
                    {/* <span className="text-white text-sm uppercase font-bold">Advance Mortgages & Protection</span> */}


                </div>
                <nav className="flex-grow px-4">
                    {NAV_SECTIONS.map((section, sectionIndex) => (
                        <Fragment key={sectionIndex}>
                            {section.some(item => hasAccess(item.id, currentUser.role)) && (
                                <ul className={sectionIndex > 0 ? "pt-4 mt-4 border-t border-gray-700" : ""}>
                                    {section.filter(item => hasAccess(item.id, currentUser.role)).map((item: NavItem) => (
                                        <li key={item.id}>
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setView(item.id); }}
                                                className={`flex items-center gap-3 px-3 py-2.5 my-1 rounded-md text-sm font-medium transition-colors ${currentView === item.id
                                                    ? 'bg-sidebar-active-bg text-white'
                                                    : 'text-sidebar-text hover:bg-sidebar-active-bg hover:text-white'
                                                    }`}
                                            >
                                                <span className="w-5 h-5">{item.icon}</span>
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Fragment>
                    ))}
                </nav>
                <div class="text-center text-white/75 text-xs py-5">
                    <div>© {currentYear} - Advance Mortgages.</div>
                    <div>by <a href="https://amigosoft.in/" target="_blank"> Amigosoft </a> All rights reserved </div>
                </div>

            </aside >
        </>
    );
};

const Navbar: React.FC<{ onLogout: () => void; onMenuClick: () => void; }> = ({ onLogout, onMenuClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { currentUser } = useContext(DataContext);

    if (!currentUser) return null;

    return (
        <header className="h-16 bg-surface flex items-center justify-between lg:justify-end px-4 sm:px-8 border-b border-gray-200">
            <button
                onClick={onMenuClick}
                className="text-text-secondary hover:text-text-primary lg:hidden"
                aria-label="Open sidebar"
            >
                {MenuIcon}
            </button>
            <div className="flex items-center space-x-6">
                {/* <NotificationBell /> */}
                <div className="relative">
                    <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 cursor-pointer">
                        {/* <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full" /> */}
                        <div>
                            <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                            <p className="text-xs text-text-secondary">{currentUser.role}</p>
                        </div>
                        {ChevronDownIcon}
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-md py-1 ring-1 ring-black ring-opacity-5 z-10">
                            <button
                                onClick={onLogout}
                                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100"
                            >
                                {LogOutIcon}
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
};

const App: React.FC = () => {
    const { currentView, setCurrentView, currentUser, login, logout, loading } = useContext(DataContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderView = () => {
        if (!currentUser || !hasAccess(currentView, currentUser.role)) {
            return <AccessDenied />;
        }
        switch (currentView) {
            case View.Dashboard: return <DashboardView />;
            case View.Leads: return <ClientsView />;
            case View.Contacts: return <ContactsView />;
            case View.Deals: return <DealsView />;
            case View.Tasks: return <TasksView />;
            case View.Calendar: return <CalendarView />;
            case View.EmailTemplates: return <EmailTemplatesView />;
            case View.Proposals: return <ProposalsView />;
            // case View.AiAssistant: return <AiAssistantView />;
            case View.Team: return <TeamView />;
            case View.Settings: return <AdminView />;
            case View.PasswordManager: return <PasswordManagerView />;
            case View.BusinessLedger: return <BusinessLedgerView />;
            default: return <DashboardView />;
        }
    };

    const handleSetView = useCallback((view: View) => {
        setCurrentView(view);
        setIsSidebarOpen(false); // Close sidebar on nav item click
    }, [setCurrentView]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p className="text-text-secondary">Loading Application...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginView onLogin={login} />;
    }

    // return (
    //     <div className="flex h-screen bg-background">
    //         <Sidebar
    //             currentView={currentView}
    //             setView={handleSetView}
    //             isOpen={isSidebarOpen}
    //             setIsOpen={setIsSidebarOpen}
    //         />
    //         <main className="flex-1 flex flex-col lg:ml-64">
    //             <Navbar onLogout={logout} onMenuClick={() => setIsSidebarOpen(true)} />
    //             <div className="flex-1 overflow-y-auto bg-background">
    //                 {renderView()}
    //             </div>
    //         </main>


    //     </div>
    // );
    return (
        <BrowserRouter>
            <Routes>
                {/* 🟢 Password reset page (public route) */}
                <Route path="/reset-password" element={<ResetPasswordView />} />

                {/* 🟢 Main application (protected area) */}
                <Route
                    path="*"
                    element={
                        !currentUser ? (
                            <LoginView onLogin={login} />
                        ) : (
                            <div className="flex h-screen bg-background">
                                <Sidebar
                                    currentView={currentView}
                                    setView={handleSetView}
                                    isOpen={isSidebarOpen}
                                    setIsOpen={setIsSidebarOpen}
                                />
                                <main className="flex-1 flex flex-col lg:ml-64">
                                    <Navbar onLogout={logout} onMenuClick={() => setIsSidebarOpen(true)} />
                                    <div className="flex-1 overflow-y-auto bg-background">
                                        {renderView()}
                                    </div>
                                </main>
                            </div>
                        )
                    }
                />
                {/* 👇 Catch-all route (404) */}
                <Route path="*" element={<NotFoundView />} />
            </Routes>

        </BrowserRouter>
    );
};

export default App;
