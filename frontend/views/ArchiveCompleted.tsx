

import { useContext, useMemo, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { View } from "@/types";
import type { Client, Contact, Task, Applicant, PropertyDetails, ProductDetails, BusinessWrittenType, ProfessionalContact, EstateAgentContact, LimitedCompanyDetails, Document, CaseStatus, Note, TeamMember } from '../types';
import * as XLSX from "xlsx";


import { businessWrittenDisplayMap } from "../constants";

export const ArchiveCompleted = () => {
    const { clients, setSelectedClientIdForNav, setCurrentView, setPreviousView } = useContext(DataContext);
    const navigate = useNavigate();


    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    const [caseStatusFilter, setCaseStatusFilter] = useState<string>(''); // '' = no filter




    // type SortKey =
    //     | "caseReference"
    //     | "name"
    //     | "caseStatus"
    //     | "product"
    //     | "primaryAdvisor"
    //     | "createdDate";

    // const [sortKey, setSortKey] = useState<SortKey>("createdDate");
    // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // const handleSort = (key: SortKey) => {
    //     if (sortKey === key) {
    //         setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    //     } else {
    //         setSortKey(key);
    //         setSortOrder("asc");
    //     }
    // };


    type SortKey = 'name' | 'product' | 'primaryAdvisor' | 'lastContacted' | 'introducer' | 'createdDate' | 'caseReference' | '';
    type SortOrder = 'asc' | 'desc';

    const [sortKey, setSortKey] = useState<SortKey>('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ active }: { active: boolean }) => (
        <span className="ml-1 text-xs">{active ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
    );

    // const filteredClients = useMemo(() => {
    //     return clients.filter(client =>
    //         client.status !== 'Lead' &&
    //         (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             client.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    //         (caseStatusFilter ? client.caseStatus === caseStatusFilter : true)
    //     );
    // }, [searchTerm, clients, caseStatusFilter]);

    const completedClients = useMemo(() => {
        let result = clients.filter(client =>
            client.caseStatus?.trim().toLowerCase() === "completed" &&
            (
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
            ) &&
            (caseStatusFilter ? client.caseStatus === caseStatusFilter : true)
        );



        if (!sortKey) return result;

        return [...result].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortKey) {
                case 'name':
                    valA = a.name?.toLowerCase() || '';
                    valB = b.name?.toLowerCase() || '';
                    break;

                case 'product':
                    valA = a.productDetails?.businessWritten || '';
                    valB = b.productDetails?.businessWritten || '';
                    break;

                // case 'status':
                //     valA = a.caseStatus || '';
                //     valB = b.caseStatus || '';
                //     break;

                case 'primaryAdvisor':
                    valA = a.primaryAdvisor?.toLowerCase() || '';
                    valB = b.primaryAdvisor?.toLowerCase() || '';
                    break;

                case 'lastContacted':
                    valA = a.lastContacted ? new Date(a.lastContacted).getTime() : 0;
                    valB = b.lastContacted ? new Date(b.lastContacted).getTime() : 0;
                    break;

                case 'introducer':
                    valA = a.applicants?.[0]?.introducer?.toLowerCase() || '';
                    valB = b.applicants?.[0]?.introducer?.toLowerCase() || '';
                    break;

                case 'createdDate':
                    valA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
                    valB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
                    break;

                case 'caseReference':
                    valA = a.caseReference?.toLowerCase() || '';
                    valB = b.caseReference?.toLowerCase() || '';
                    break;

                default:
                    return 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [clients, searchTerm, caseStatusFilter, sortKey, sortOrder]);


    // const completedClients = useMemo(() => {
    //     const filtered = clients.filter(
    //         c => c.caseStatus?.trim().toLowerCase() === "completed"
    //     );

    //     return filtered.sort((a, b) => {
    //         let aVal: any = a[sortKey];
    //         let bVal: any = b[sortKey];

    //         // date handling
    //         if (sortKey === "createdDate") {
    //             aVal = new Date(aVal).getTime();
    //             bVal = new Date(bVal).getTime();
    //         }

    //         // string handling
    //         if (typeof aVal === "string") {
    //             return sortOrder === "asc"
    //                 ? aVal.localeCompare(bVal)
    //                 : bVal.localeCompare(aVal);
    //         }

    //         return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    //     });
    // }, [clients, sortKey, sortOrder]);


    const SortableTh = ({
        label,
        column,
    }: {
        label: string;
        column: SortKey;
    }) => (
        <th
            onClick={() => handleSort(column)}
            className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none hover:bg-gray-100"
        >
            <span className="flex items-center gap-1">
                {label}
                {sortKey === column && (
                    <span className="text-xs">
                        {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                )}
            </span>
        </th>
    );



    const handleView = (clientId: string) => {
        // same behavior as ClientsView navigation
        setPreviousView(View.ArchiveCompleted);
        setSelectedClientIdForNav(clientId);
        setCurrentView(View.Leads); // or View.Leads if enum
    };



    const emptyApplicant: Applicant = {
        title: '', firstName: '', middleName: '', surname: '', gender: '', dob: '',
        homeTelephone: '', mobileNumber: '', email: '', currentAddress: '', noOfDependents: 0, nationality: '', introducer: '', created_at: ''
    };


    const caseStatusColors: Record<string, string> = {
        // 'Enquiry': 'bg-blue-500 text-white',
        // 'AIP': 'bg-yellow-400 text-black',
        // 'FMA Submitted': 'bg-purple-500 text-white',
        // 'Offered': 'bg-orange-500 text-white',
        // 'Exchanged': 'bg-indigo-500 text-white',
        'Completed': 'bg-green-500 text-white',
        // 'Renewal': 'bg-gray-600 text-white',
        // 'On Risk': 'bg-red-500 text-white',
        // 'Commission Due': 'bg-pink-500 text-white',
        // 'NPW': 'bg-cyan-500 text-white',
        // 'Other': 'bg-gray-500 text-black',
    };



    const handleExport = () => {
        if (!completedClients.length) {
            alert("No data to export");
            return;
        }

        const json = JSON.stringify(completedClients, null, 2);

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "completed_clients.json";
        link.click();

        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const rows = completedClients.map(c => ({
            Name: c.name,
            Email: c.email,
            CaseReference: c.caseReference,
            CaseStatus: c.caseStatus,
            Advisor: c.primaryAdvisor,
            Product: c.productDetails?.businessWritten,
            CreatedDate: c.createdDate,
        }));

        const csv = [
            Object.keys(rows[0]).join(","),
            ...rows.map(r => Object.values(r).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "completed_clients.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    // const handleExportExcel = () => {
    //     if (!completedClients.length) {
    //         alert("No data to export");
    //         return;
    //     }

    //     const rows = completedClients.map(client => ({
    //         // BASIC
    //         Name: client.name,
    //         Email: client.email,
    //         Phone: client.phone,
    //         CaseReference: client.caseReference,
    //         CaseStatus: client.caseStatus,
    //         Advisor: client.primaryAdvisor,
    //         CreatedDate: client.createdDate,
    //         LastContacted: client.lastContacted,

    //         // APPLICANT (FIRST)
    //         Applicant1_Name: client.applicants?.[0]
    //             ? `${client.applicants[0].firstName} ${client.applicants[0].surname}`
    //             : "",
    //         Applicant1_DOB: client.applicants?.[0]?.dob,
    //         Applicant1_Email: client.applicants?.[0]?.email,
    //         Applicant1_Phone: client.applicants?.[0]?.mobileNumber,

    //         // SECOND APPLICANT
    //         Applicant2_Name: client.applicants?.[1]
    //             ? `${client.applicants[1].firstName} ${client.applicants[1].surname}`
    //             : "",

    //         // PROPERTY
    //         Property_Address: client.property?.address,
    //         Property_Value: client.property?.propertyValue,

    //         // PRODUCT
    //         Product: client.productDetails?.businessWritten,
    //         Mortgage_Type: client.productDetails?.mortgage?.mortgageType,
    //         Loan_Amount: client.productDetails?.mortgage?.mortgageLoanAmount,

    //         // NOTES (JOIN)
    //         Notes: client.notes?.map(n => n.text).join(" | "),
    //     }));

    //     const worksheet = XLSX.utils.json_to_sheet(rows);
    //     const workbook = XLSX.utils.book_new();

    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    //     XLSX.writeFile(workbook, "completed_clients.xlsx");
    // };

    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Archive Clients</h1>
                <button
                    onClick={handleExportCSV}
                    className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md"
                >
                    Export
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none"
                                onClick={() => handleSort('createdDate')}
                            >
                                Date of Enquiry
                                <SortIcon active={sortKey === 'createdDate'} />
                            </th>

                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('caseReference')}>Case Reference <SortIcon active={sortKey === 'caseReference'} /> </th>

                            <th
                                className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none"
                                onClick={() => handleSort('name')}
                            > First Name <SortIcon active={sortKey === 'name'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('name')}>Surname <SortIcon active={sortKey === 'name'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" >Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('product')}>Product <SortIcon active={sortKey === 'product'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('primaryAdvisor')}>Adviser <SortIcon active={sortKey === 'primaryAdvisor'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('lastContacted')}>Last Accessed <SortIcon active={sortKey === 'lastContacted'} /> </th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('introducer')}>Introducer <SortIcon active={sortKey === 'introducer'} /> </th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedClients.filter(client => client.status !== 'Pipeline').map(client => {

                            // ✅ client exists here
                            const [firstName, ...rest] = client.name?.trim().split(" ") || [];
                            const surname = rest.join(" ");

                            // console.log(client.createdDate);
                            // console.log(new Date(client.createdDate));

                            return (
                                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {
                                            client.applicants[0].created_at
                                                ? new Date(client.applicants[0].created_at).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "N/A"
                                        }



                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-text-primary text-sm">
                                            {client.caseReference || "N/A"}
                                        </p>
                                    </td>

                                    {/* <td className="px-6 py-4 flex items-center">
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{client.name}</p>
                                                        <p className="text-xs text-text-secondary">{client.email}</p>
                                                    </div>
                                                </td> */}
                                    {/* <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${client.status === 'Active' ? 'bg-success/20 text-success' : (client.status === 'Lead' ? 'bg-warning/20 text-warning' : 'bg-gray-500/20 text-gray-500')}`}>
                                                        {client.status}
                                                    </span>
                                                </td> */}
                                    {/* First Name */}
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-text-primary">
                                            {firstName || "N/A"}
                                        </p>
                                        <p className="text-xs text-text-secondary">{client.email}</p>
                                    </td>

                                    {/* Surname */}
                                    <td className="px-6 py-4">
                                        {surname || "N/A"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {/* {client.caseStatus ? (
                                                        <span className="px-3 py-1 text-xs rounded-full inline-block bg-[#002d62] text-white">
                                                            {client.caseStatus}
                                                        </span>
                                                    ) : 'N/A'} */}
                                        {client.caseStatus ? (
                                            <span className={`px-3 py-1 text-xs rounded-full inline-block ${caseStatusColors[client.caseStatus] || 'bg-gray-200 text-black'}`}>
                                                {client.caseStatus}
                                            </span>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {businessWrittenDisplayMap[client.productDetails?.businessWritten || 'N/A']}                                        {/* {client.productDetails?.businessWritten || 'N/A'} */}

                                    </td>

                                    <td>
                                        {client.primaryAdvisor}
                                    </td>


                                    <td className="px-6 py-4">
                                        {client.lastContacted
                                            ? new Date(client.lastContacted).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "numeric",
                                                year: "numeric",
                                            })
                                            : "N/A"}

                                    </td>
                                    <td className="px-6 py-4">
                                        {client.applicants?.[0]?.introducer || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleView(client.id)}
                                            className="text-blue-600 hover:underline text-sm font-semibold"
                                        >
                                            View
                                        </button>


                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
