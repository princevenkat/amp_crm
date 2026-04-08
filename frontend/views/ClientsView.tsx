import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import type { Client, Contact, Task, Applicant, PropertyDetails, ProductDetails, BusinessWrittenType, ProfessionalContact, EstateAgentContact, LimitedCompanyDetails, Document, CaseStatus, Note, TeamMember } from '../types';
import { DataContext } from '../contexts/DataContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import DuplicateButton from '../components/duplicateClient';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { NewClientForm } from '../components/forms/NewClientForm';
import { NewTaskForm } from '../components/forms/NewTaskForm';
import { PlusIcon, SearchIcon, MinusIcon, EditIcon } from '../components/ui/Icons';
import { ContactType, TaskStatus, UserRole, ProtectionItem } from '../types';

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateForInput, formatDateForDisplay } from "@/utils/dateUtils";

const formatDateForInputNew = (value?: string) => {
    if (!value) return "";

    // 🔥 NO Date(), NO timezone
    return value.includes("T")
        ? value.split("T")[0]
        : value.split(" ")[0];
};




import { toast, Toaster, ToastBar } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/solid';
import ProfessionalContactField from '@/components/ProfessionalContactField';
import { NewContactForm } from '@/components/forms/NewContactForm';

import { businessWrittenDisplayMap } from "../constants";

import { useNavigate } from "react-router-dom";

const emptyApplicant: Applicant = {
    title: '', firstName: '', middleName: '', surname: '', gender: '', dob: '',
    homeTelephone: '', mobileNumber: '', email: '', currentAddress: '', noOfDependents: 0, nationality: '', introducer: '', created_at: ''
};


interface ApplicantDetailsProps {
    applicant: Applicant;
    index: number;
    isEditing: boolean;
    onChange: (index: number, field: keyof Applicant, value: any) => void;
    copyAddressFrom?: string; // optional address to copy from
    allApplicants?: Applicant[]; // add this
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({ applicant, index, isEditing, onChange, copyAddressFrom, allApplicants }) => {

    if (!isEditing) {
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Applicant {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <p><strong className="text-text-secondary">Full Name:</strong> {applicant.title} {applicant.firstName} {applicant.middleName} {applicant.surname}</p>
                    <p><strong className="text-text-secondary">Gender:</strong> {applicant.gender}</p>
                    <p><strong className="text-text-secondary">Date of Birth:</strong>
                        {applicant.dob
                            ? new Date(applicant.dob).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "numeric",
                                year: "numeric",
                            })
                            : "—"}

                    </p>
                    <p><strong className="text-text-secondary">Nationality:</strong> {applicant.nationality}</p>
                    <p><strong className="text-text-secondary">Email:</strong> {applicant.email}</p>
                    <p><strong className="text-text-secondary">Mobile:</strong> {applicant.mobileNumber}</p>
                    <p><strong className="text-text-secondary">Home Tel:</strong> {applicant.homeTelephone}</p>
                    <p><strong className="text-text-secondary">Introducer:</strong> {applicant.introducer}</p>
                    <p className="col-span-2"><strong className="text-text-secondary">Address:</strong> {applicant.currentAddress}</p>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const finalValue = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;
        onChange(index, name as keyof Applicant, finalValue);
    };

    const handleCopyAddress = () => {
        if (copyAddressFrom) {
            onChange(index, 'currentAddress', copyAddressFrom);
        }
    };

    const formFields: { name: keyof Applicant; label: string; type: string; required: boolean; fullWidth?: boolean; options?: string[] }[] = [
        { name: 'title', label: 'Title', type: 'select', required: true, options: ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof'] },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'middleName', label: 'Middle Name', type: 'text', required: false },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: false },
        { name: 'homeTelephone', label: 'Home Telephone', type: 'tel', required: false },
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true },
        { name: 'currentAddress', label: 'Current Address', type: 'text', required: false, fullWidth: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'noOfDependents', label: 'No Of Dependents', type: 'number', required: false },
        { name: 'nationality', label: 'Nationality', type: 'text', required: false },
        { name: 'introducer', label: 'Introducer', type: 'text', required: false },
    ];

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">
                Applicant {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formFields.map((field) => {
                    // Special handling for Current Address
                    if (field.name === 'currentAddress') {
                        return (
                            <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                                <label className="block font-medium text-text-secondary mb-1 flex justify-between items-center">
                                    {field.label}
                                    {/* {copyAddressFrom && (
                                        <button
                                            type="button"
                                            className="text-sm text-blue-600 hover:underline"
                                            onClick={handleCopyAddress}
                                        >
                                            Copy Address
                                        </button>
                                    )} */}
                                    {allApplicants && allApplicants.length > 1 && (
                                        <select
                                            className="text-sm text-black text-sm bg-surface border border-gray-300 rounded-md py-2 px-3 cursor-pointer flex-fill"
                                            onChange={(e) => {
                                                const selectedIndex = parseInt(e.target.value, 10);
                                                if (!isNaN(selectedIndex)) {
                                                    onChange(index, 'currentAddress', allApplicants[selectedIndex].currentAddress);
                                                }
                                            }}
                                        >
                                            <option value="">Copy Address From...</option>
                                            {allApplicants.map((a, i) => (
                                                i !== index && ( // don't include the current applicant
                                                    <option key={i} value={i}>
                                                        Applicant {i + 1} - {a.firstName} {a.surname}
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                    )}
                                </label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={String(applicant[field.name])}
                                        onChange={handleChange}
                                        className="flex-1 bg-surface border border-gray-300 rounded-md p-2"
                                        required={field.required}
                                    />

                                </div>
                            </div>
                        );
                    }

                    // Normal fields
                    return (
                        <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                            <label className="block font-medium text-text-secondary mb-1">{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    value={String(applicant[field.name])}
                                    onChange={handleChange}
                                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                                    required={field.required}
                                >
                                    <option value="">Select...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={String(applicant[field.name])}
                                    onChange={handleChange}
                                    className="w-full bg-surface border border-gray-300 rounded-md p-2"
                                    required={field.required}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        // <div className="mb-6">
        //     <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Applicant {index + 1}</h3>
        //     {/* Copy address button */}
        //     {copyAddressFrom && (
        //         <button type="button" className="mb-2 text-sm text-blue-600 hover:underline" onClick={handleCopyAddress} >
        //             Copy address from first applicant
        //         </button>
        //     )}
        //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        //         {formFields.map(field => (
        //             <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
        //                 <label className="block font-medium text-text-secondary mb-1">{field.label}</label>
        //                 {field.type === 'select' ? (
        //                     <select name={field.name} value={String(applicant[field.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required}>
        //                         <option value="">Select...</option>
        //                         {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        //                     </select>
        //                 ) : (
        //                     <input type={field.type} name={field.name} value={String(applicant[field.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required} />
        //                 )}
        //             </div>
        //         ))}
        //     </div>
        // </div>
    );
};

const PropertyView: React.FC<{ property: PropertyDetails; isEditing: boolean; onChange: (field: keyof PropertyDetails, value: any) => void; allApplicants?: Applicant[]; }> = ({ property, isEditing, onChange, allApplicants }) => {
    // console.log("property from backend:", property);
    // console.log("propertyType from backend:", property?.propertyType);


    if (!isEditing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <p className="col-span-2"><strong className="text-text-secondary">Address:</strong> {property.address}</p>
                <p><strong className="text-text-secondary">Property Value:</strong> {formatCurrency(property.propertyValue)}</p>
                <p><strong className="text-text-secondary">Purchase Price:</strong> {formatCurrency(property.purchasePrice)}</p>
                <p>
                    <strong className="text-text-secondary">Date of Purchase:</strong>
                    {property.dateOfPurchase
                        ? new Date(property.dateOfPurchase).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "numeric",
                            year: "numeric",
                        })
                        : "—"}
                </p>
                <p><strong className="text-text-secondary">Year Built:</strong> {property.yearBuilt}</p>
                <p><strong className="text-text-secondary">Property Type:</strong> {property.propertyType || "—"}</p>
                <p><strong className="text-text-secondary">Ex-Local Authority:</strong> {property.isExLocal ? 'Yes' : 'No'}</p>
                <p><strong className="text-text-secondary">Bedrooms:</strong> {property.bedrooms}</p>
                <p><strong className="text-text-secondary">Living Rooms:</strong> {property.livingRooms}</p>
                <p><strong className="text-text-secondary">Kitchens:</strong> {property.kitchens}</p>
                <p><strong className="text-text-secondary">Bathrooms:</strong> {property.bathrooms}</p>
                <p><strong className="text-text-secondary">Separate Toilets:</strong> {property.separateToilets}</p>
                <p><strong className="text-text-secondary">Garage/Parking:</strong> {property.hasGarageOrParking ? 'Yes' : 'No'}</p>

                {property.propertyType === 'Flat' && (
                    <>
                        <hr className="col-span-2 my-2" />
                        <p className="col-span-2 text-md font-semibold text-text-primary">Flat Details</p>
                        <p><strong className="text-text-secondary">Flats in Block:</strong> {property.flatsInBlock}</p>
                        <p><strong className="text-text-secondary">Storeys in Block:</strong> {property.storeysInBlock}</p>
                        <p><strong className="text-text-secondary">Floor of Flat:</strong> {property.floorOfFlat}</p>
                        <p><strong className="text-text-secondary">Lease Remaining:</strong> {property.leaseRemaining} years</p>
                        <p><strong className="text-text-secondary">Ground Rent (p.a.):</strong> ${property.groundRent}</p>
                        <p><strong className="text-text-secondary">Service Charge (p.a.):</strong> ${property.serviceCharge}</p>
                    </>
                )}
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') finalValue = parseInt(value, 10) || 0;
        if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;
        onChange(name as keyof PropertyDetails, finalValue);
    };

    const fields: { name: keyof PropertyDetails; label: string; type: string; fullWidth?: boolean; options?: string[] }[] = [
        { name: 'address', label: 'Address', type: 'text', fullWidth: true },
        { name: 'propertyValue', label: 'Property Value', type: 'number' },
        { name: 'purchasePrice', label: 'Purchase Price', type: 'number' },
        { name: 'dateOfPurchase', label: 'Date of Purchase', type: 'date' },
        { name: 'yearBuilt', label: 'Year Built', type: 'number' },
        { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Detached', 'Semi-detached', 'Bungalow', 'Mid-terraced', 'End of terrace', 'Purpose-built Flat', 'Converted flat'] },
        { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
        { name: 'livingRooms', label: 'Living Rooms', type: 'number' },
        { name: 'kitchens', label: 'Kitchens', type: 'number' },
        { name: 'bathrooms', label: 'Bathrooms', type: 'number' },
        { name: 'separateToilets', label: 'Separate Toilets', type: 'number' },
        { name: 'isExLocal', label: 'Ex-Local Authority', type: 'checkbox' },
        { name: 'hasGarageOrParking', label: 'Has Garage/Parking', type: 'checkbox' },
    ];

    const flatFields: { name: keyof PropertyDetails; label: string; type: 'number' }[] = [
        { name: 'flatsInBlock', label: 'Flats in Block', type: 'number' },
        { name: 'storeysInBlock', label: 'Storeys in Block', type: 'number' },
        { name: 'floorOfFlat', label: 'Floor of Flat', type: 'number' },
        { name: 'leaseRemaining', label: 'Lease Remaining (yrs)', type: 'number' },
        { name: 'groundRent', label: 'Ground Rent (p.a.)', type: 'number' },
        { name: 'serviceCharge', label: 'Service Charge (p.a.)', type: 'number' },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* {fields.map(f => (
                <div key={f.name} className={f.fullWidth ? 'md:col-span-2' : (f.type === 'checkbox' ? 'flex items-center gap-2' : '')}>
                    <label className="block font-medium text-text-secondary mb-1">{f.label}</label>
                    {f.type === 'select' ? (
                        <select name={f.name} value={String(property[f.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2">
                            <option value="">Select...</option>
                            {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : f.type === 'checkbox' ? (
                        <input type="checkbox" name={f.name} checked={!!property[f.name]} onChange={handleChange} className="bg-surface border border-gray-300 rounded-md" />
                    ) : (
                        // <input type={f.type} name={f.name} value={String(property[f.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        <input
                            type={f.type}
                            name={f.name}
                            value={
                                f.type === "date" && property[f.name]
                                    ? new Date(property[f.name] as string).toISOString().split("T")[0]
                                    : String(property[f.name] ?? "")
                            }
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />

                    )}
                </div>
            ))} */}
            {fields.map(f => (
                <div
                    key={f.name}
                    className={
                        f.fullWidth
                            ? "md:col-span-2"
                            : f.type === "checkbox"
                                ? "flex items-center gap-2"
                                : ""
                    }
                >
                    <label className="block font-medium text-text-secondary mb-1 flex justify-between items-center">
                        {f.label}
                        {/* 🔽 Copy Address Dropdown – Only for address field */}
                        {f.name === "address" && allApplicants && allApplicants.length > 0 && (
                            <div className="mb-2">
                                <select
                                    className="text-sm text-black text-sm bg-surface border border-gray-300 rounded-md py-2 px-3 cursor-pointer flex-fill"
                                    onChange={(e) => {
                                        const index = parseInt(e.target.value, 10);
                                        if (!isNaN(index)) {
                                            onChange("address", allApplicants[index].currentAddress);
                                        }
                                    }}
                                >
                                    <option value="">Copy Address From Applicant...</option>
                                    {allApplicants.map((a, i) => (
                                        <option key={i} value={i}>
                                            Applicant {i + 1} — {a.firstName} {a.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                    </label>


                    {/* 🔽 Normal Field Rendering */}
                    {f.type === "select" ? (
                        <select
                            name={f.name}
                            value={String(property[f.name])}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Select...</option>
                            {f.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    ) : f.type === "checkbox" ? (
                        <input
                            type="checkbox"
                            name={f.name}
                            checked={!!property[f.name]}
                            onChange={handleChange}
                            className="bg-surface border border-gray-300 rounded-md"
                        />
                    ) : (
                        <input
                            type={f.type}
                            name={f.name}
                            value={
                                f.type === "date" && property[f.name]
                                    ? new Date(property[f.name] as string)
                                        .toISOString()
                                        .split("T")[0]
                                    : String(property[f.name] ?? "")
                            }
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />
                    )}
                </div>
            ))}

            {property.propertyType === 'Flat' && (
                <>
                    <hr className="col-span-2 my-2" />
                    <p className="col-span-2 text-md font-semibold text-text-primary">Flat Details</p>
                    {flatFields.map(f => (
                        <div key={f.name}>
                            <label className="block font-medium text-text-secondary mb-1">{f.label}</label>
                            <input type="number" name={f.name} value={String(property[f.name] || '')} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h4 className="text-md font-semibold text-text-primary border-b pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">{children}</div>
    </div>
);

const FormSectionFull: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h4 className="text-md font-semibold text-text-primary border-b pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-x-8 gap-y-4 text-sm">{children}</div>
    </div>
);

const FormSectionNew: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        {title && (
            <h4 className="text-md font-semibold text-text-primary border-b pb-2 mb-4">
                {title}
            </h4>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 text-sm">{children}</div>
    </div>
);

const ProductView: React.FC<{
    productDetails: ProductDetails;
    propertyValue: number;
    isEditing: boolean;
    onChange: (key: keyof ProductDetails, value: any) => void;
    onSubFieldChange: (section: Exclude<keyof ProductDetails, 'businessWritten'>, field: string, value: any) => void;
    advisors: string[];
}> = ({ productDetails, propertyValue, isEditing, onChange, onSubFieldChange, advisors }) => {

    // console.log('Product Details Limited Company:', productDetails);
    // console.log('Product Details:', productDetails);

    const { getContactsByType } = useContext(DataContext)

    const lenders = getContactsByType(ContactType.Lender);

    const providers = getContactsByType(ContactType.Provider);
    const solicitors = getContactsByType(ContactType.Provider);
    const accountants = getContactsByType(ContactType.Accountant);
    const surveyors = getContactsByType(ContactType.Surveyor);
    const estateAgents = getContactsByType(ContactType.EstateAgent);


    // console.log(JSON.stringify(productDetails, null, 2))

    const [directors, setDirectors] = useState<string[]>(productDetails.limitedCompany?.directors || ['']);

    useEffect(() => {
        setDirectors(productDetails.limitedCompany?.directors || ['']);
    }, [productDetails.limitedCompany?.directors]);


    const handleDirectorChange = (index: number, value: string) => {
        const newDirectors = [...directors];
        newDirectors[index] = value;
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };

    const addDirector = () => {
        const newDirectors = [...directors, ''];
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };

    const removeDirector = (indexToRemove: number) => {
        const newDirectors = directors.filter((_, index) => index !== indexToRemove);
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };

    const businessWritten = productDetails.businessWritten;

    // const showMortgage = businessWritten === 'Mortgage Only';
    // const showProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection';
    // const showBuildingContent = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';
    // const showMortgageProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';

    // Determine which sections should show
    const showMortgage = businessWritten === 'Mortgage Only' || businessWritten === 'Mortgage & Protection';
    const showProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';
    const showBuildingContent = businessWritten === 'Building & Content';



    let protections: ProtectionItem[] = [];

    // 1️⃣ If `protections` exists
    if (Array.isArray(productDetails.protections)) {
        protections = productDetails.protections.map(item => {
            if (typeof item === 'string') {
                try {
                    return JSON.parse(item); // parse stringified JSON
                } catch (err) {
                    console.error("Failed to parse nested protection JSON:", err);
                    return null;
                }
            }
            return item;
        }).filter(Boolean);
    }
    // 2️⃣ If backend sent `protection_json` as string
    else if (productDetails.protection_json) {
        try {
            let parsed = JSON.parse(productDetails.protection_json);

            if (Array.isArray(parsed)) {
                protections = parsed.map(item => {
                    if (typeof item === 'string') {
                        try {
                            return JSON.parse(item);
                        } catch (err) {
                            console.error("Failed to parse nested protection_json item:", err);
                            return null;
                        }
                    }
                    return item;
                }).filter(Boolean);
            } else {
                protections = [parsed];
            }
        } catch (err) {
            console.error("Failed to parse protection_json:", err);
        }
    }
    // 3️⃣ Fallback: nested `protection.protection_json`
    else if (productDetails?.protection_json) {
        try {
            let parsed = JSON.parse(productDetails?.protection_json);
            protections = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
            console.error("Failed to parse nested protection.protection_json:", err);
        }
    }

    // ✅ Unwrap extra array if needed
    if (Array.isArray(protections) && protections.length === 1 && Array.isArray(protections[0])) {
        protections = protections[0];
    }


    // console.log("full productDetails:", protections);



    const formatForDateInput = (date?: string) =>
        date ? date.substring(0, 10) : "";


    const date = new Date(productDetails.mortgage.renewalReminderDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    // console.log(new Date(productDetails.mortgage.renewalReminderDate));

    // console.log(`${year}-${month}-${day}`);


    return (
        <div className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="font-semibold text-text-secondary">Business Written</label>
                    {isEditing ? (
                        // <select
                        //     value={productDetails.businessWritten}
                        //     onChange={(e) => onChange('businessWritten', e.target.value as BusinessWrittenType)}
                        //     className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                        //     disabled={!isEditing}
                        // >
                        //     <option value="">Select...</option>
                        //     <option>Mortgage Only</option>
                        //     <option>Protection Only</option>
                        //     <option>Building & Content</option>
                        //     <option>Mortgage & Protection</option>
                        // </select>
                        <select
                            value={productDetails.businessWritten}
                            onChange={(e) =>
                                onChange('businessWritten', e.target.value as BusinessWrittenType)
                            }
                            className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            disabled={!isEditing}
                        >
                            <option value="">Select...</option>
                            <option value="Mortgage Only">Mortgage Only</option>
                            <option value="Protection Only">Protection Only</option>
                            <option value="Building & Content">Bridge Loan</option>
                            <option value="Mortgage & Protection">Commercial Loan</option>
                        </select>
                    ) : (
                        <p className="py-2">
                            {/* {productDetails.businessWritten} */}
                            {businessWrittenDisplayMap[productDetails.businessWritten]}

                        </p>
                    )}
                </div>
            </div>


            {showMortgage && (
                <FormSection title="Mortgage Details">
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Advisor</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.mortgage?.advisor || ''} onChange={(e) => onSubFieldChange('mortgage', 'advisor', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                {advisors.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.advisor || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Type</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.mortgage?.mortgageType || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                <option>Further Advance</option>
                                <option>Product switch</option>
                                <option>Purchase</option>
                                <option>Remortgage with capital raising</option>
                                <option>Remortgage without Capital raising</option>
                                {/* <option>Limited Co BTL</option> */}
                            </select>
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.mortgageType}</p>
                        )}
                    </div>

                    <div>
                        <label className="font-semibold text-text-secondary">Business Type</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.mortgage?.businessType || ''} onChange={(e) => onSubFieldChange('mortgage', 'businessType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                <option>Buy-to-Let</option>
                                <option>Ex-Pat Buy-to-let</option>
                                <option>Ex-Pat Residential</option>
                                <option>Holiday Let</option>
                                <option>Ltd Company BTL</option>
                                <option>Residential</option>
                            </select>
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.businessType}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date of FMA</label>
                        {isEditing ? (
                            <input
                                disabled={!isEditing}
                                type="date"
                                value={formatDateForInputNew(productDetails.mortgage?.dateOfFma)}
                                onChange={(e) => onSubFieldChange('mortgage', 'dateOfFma', e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            />
                        ) : (
                            <p className="py-2">
                                {productDetails.mortgage?.dateOfFma
                                    ? new Date(productDetails.mortgage.dateOfFma).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date Offered</label>
                        {isEditing ? (
                            <input
                                disabled={!isEditing}
                                type="date"
                                value={formatDateForInputNew(productDetails.mortgage?.dateOffered)}
                                onChange={(e) => onSubFieldChange('mortgage', 'dateOffered', e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            />
                        ) : (
                            <p className="py-2">
                                {productDetails.mortgage?.dateOffered
                                    ? new Date(productDetails.mortgage?.dateOffered).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="font-semibold text-text-secondary">Lender Reference</label>

                        {isEditing ? (
                            // <input disabled={!isEditing} type="text" value={productDetails.mortgage?.lenderReference || ''} onChange={(e) => onSubFieldChange('mortgage', 'lenderReference', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                            <input
                                disabled={!isEditing}
                                type="text"
                                value={productDetails.mortgage?.lenderReference || ''}
                                onChange={(e) => onSubFieldChange('mortgage', 'lenderReference', e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            />
                        ) : (
                            <p className=" py-2">{productDetails.mortgage?.lenderReference}</p>
                        )}
                    </div>
                    <p><strong className="text-text-secondary">Property Value:</strong>

                        {formatCurrency(propertyValue)}
                        {/* ${Number(productDetails.mortgage?.propertyValue || propertyValue).toLocaleString()} */}
                    </p>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Loan Amount</label>

                        {isEditing ? (
                            <input disabled={!isEditing} type="number" value={productDetails.mortgage?.mortgageLoanAmount || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageLoanAmount', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />

                        ) : (
                            <p className="py-2">{formatCurrency(productDetails.mortgage?.mortgageLoanAmount)}</p>  // uses your global formatter
                        )}


                    </div>



                    <div>
                        <label className="font-semibold text-text-secondary">Fees</label>
                        {productDetails.mortgage?.fees?.map((fee, index) => (
                            <div key={index} className="flex items-center gap-2 mt-2">
                                {isEditing ? (
                                    <select
                                        disabled={!isEditing}
                                        value={fee.type}
                                        onChange={(e) => {
                                            const newFees = [...(productDetails.mortgage?.fees || [])];
                                            newFees[index].type = e.target.value;
                                            onSubFieldChange('mortgage', 'fees', newFees);
                                        }}
                                        className="p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100 w-1/2"
                                    >
                                        <option value="">Select Fee Type...</option>
                                        <option value="Broker Fee">Broker Fee</option>
                                        <option value="Procuration Fee">Procuration Fee</option>
                                        <option value="Referral Fee">Referral Fee</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p>{fee.type} - </p>  // uses your global formatter
                                )}
                                {isEditing ? (
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={fee.amount}
                                        onChange={(e) => {
                                            const newFees = [...(productDetails.mortgage?.fees || [])];
                                            newFees[index].amount = Number(e.target.value);
                                            onSubFieldChange("mortgage", "fees", newFees);
                                        }}
                                        className="p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100 w-1/2"
                                    />
                                ) : (
                                    <p >{formatCurrency(fee.amount)}</p>  // uses your global formatter
                                )}
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFees = (productDetails.mortgage?.fees || []).filter((_, i) => i !== index);
                                            onSubFieldChange('mortgage', 'fees', newFees);
                                        }}
                                        className="text-danger font-bold ml-2"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}

                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    const newFees = [...(productDetails.mortgage?.fees || []), { type: '', amount: 0 }];
                                    onSubFieldChange('mortgage', 'fees', newFees);
                                }}
                                className="mt-2 text-sm text-secondary hover:underline"
                            >
                                + Add Fee
                            </button>
                        )}
                    </div>



                    <div>
                        <label className="font-semibold text-text-secondary">Rate (%)</label>

                        {isEditing ? (
                            <input disabled={!isEditing} type="text" value={productDetails.mortgage?.rate || ''} onChange={(e) => onSubFieldChange('mortgage', 'rate', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.rate || ''}</p>  // uses your global formatter
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Product Type</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.mortgage?.productType || ''} onChange={(e) => onSubFieldChange('mortgage', 'productType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                <option>Fixed</option>
                                <option>Variable</option>
                                <option>Discount</option>
                                <option>Capped</option>

                                {/* 'Detached','Semi-detached','Bungalow','Mid-terraced','End of terrace','Purpose-built Flat','Converted flat','' */}

                                {/* <option>Detached</option>
                                <option>Semi-detached</option>
                                <option>Bungalow</option>
                                <option>Mid- terraced</option>
                                <option>End of terrace</option>
                                <option>Purpose-built Flat </option>
                                <option>Converted flat</option> */}

                            </select>
                        ) : (
                            <p className="py-2">{formatCurrency(productDetails.mortgage?.productType)}</p>  // uses your global formatter
                        )}
                    </div>


                    <div>
                        <label className="font-semibold text-text-secondary">Repayment Type</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.mortgage?.repaymentType || ''} onChange={(e) => onSubFieldChange('mortgage', 'repaymentType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                <option>Interest Only</option>
                                <option>Part & Part</option>
                                <option>Capital Repayment</option>

                                {/* 'Detached','Semi-detached','Bungalow','Mid-terraced','End of terrace','Purpose-built Flat','Converted flat','' */}

                                {/* <option>Detached</option>
                                <option>Semi-detached</option>
                                <option>Bungalow</option>
                                <option>Mid- terraced</option>
                                <option>End of terrace</option>
                                <option>Purpose-built Flat </option>
                                <option>Converted flat</option> */}

                            </select>
                        ) : (
                            <p className="py-2">{formatCurrency(productDetails.mortgage?.repaymentType)}</p>  // uses your global formatter
                        )}
                    </div>



                    <div>
                        <label className="font-semibold text-text-secondary">Product Term</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="text" value={productDetails.mortgage?.productTerm || ''} onChange={(e) => onSubFieldChange('mortgage', 'productTerm', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.productTerm}</p>  // uses your global formatter
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Term</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="text" value={productDetails.mortgage?.mortgageTerm || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageTerm', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.mortgage?.mortgageTerm}</p>  // uses your global formatter
                        )}
                    </div>

                    <div>
                        <label className="font-semibold text-text-secondary">Rate Expiry</label>
                        {isEditing ? (
                            <input disabled={!isEditing}
                                type="date"
                                value={productDetails.mortgage?.rateExpiry || ""}
                                onChange={(e) => onSubFieldChange('mortgage', 'rateExpiry', e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">
                                {productDetails.mortgage?.rateExpiry
                                    ? new Date(productDetails.mortgage.rateExpiry).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}

                            </p>  // uses your global formatter
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Renewal Reminder Date</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="date"

                                // value={formatDateForInput(productDetails.mortgage?.renewalReminderDate)}
                                value={productDetails.mortgage?.renewalReminderDate || ""}

                                onChange={(e) => onSubFieldChange('mortgage', 'renewalReminderDate', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">
                                {productDetails.mortgage?.renewalReminderDate
                                    ? new Date(productDetails.mortgage.renewalReminderDate).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>  // uses your global formatter
                        )}
                    </div>
                </FormSection>
            )}



            {showProtection && (
                <FormSectionFull title="Protection">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-x-8 gap-y-4 text-sm">
                        {/* LOOP MULTIPLE PROTECTIONS */}
                        {protections.map((prot, index) => (
                            <div key={prot._id} className="border  rounded-lg mb-4 bg-gray-50 overflow-hidden">
                                <div className="flex justify-between items-center bg-[#002d62]  px-3 py-2">
                                    <h3 className="font-bold  text-white">Protection #{index + 1}</h3>
                                    {isEditing && (
                                        <button
                                            className="text-[#002d62] text-xs font-semibold px-3 py-1 rounded-full uppercase bg-white"
                                            onClick={() => {
                                                const updated = protections.filter(p => p._id !== prot._id);
                                                onChange("protections", updated);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">

                                    {/* ADVISOR */}
                                    <div className="">
                                        <label className="font-semibold">Protection Advisor</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.advisor}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, advisor: e.target.value };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                {advisors.map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p>{prot.advisor || "Not Assigned"}</p>
                                        )}
                                    </div>

                                    {/* POLICY TYPE */}
                                    <div className="">
                                        <label className="font-semibold">Policy Type</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.policyType}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, policyType: e.target.value as ProtectionItem["policyType"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Critical Illness</option>
                                                <option>Family Income Benefit</option>
                                                <option>Income Protection</option>
                                                <option>Life and Critical Illness</option>
                                                <option>Life Cover</option>
                                                <option>Life or Critical Illness</option>
                                                <option>Mortgage Cover</option>
                                                <option>Whole of Life</option>
                                                <option>Building only</option>
                                                <option>Contents only</option>
                                                <option>Building & contents</option>
                                            </select>
                                        ) : (
                                            <p>{prot.policyType}</p>
                                        )}
                                    </div>

                                    {/* SINGLE/JOINT */}
                                    <div className="">
                                        <label className="font-semibold">Single/Joint</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.singleOrJoint}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, singleOrJoint: e.target.value as ProtectionItem["singleOrJoint"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Single</option>
                                                <option>Joint</option>
                                            </select>
                                        ) : (
                                            <p>{prot.singleOrJoint}</p>
                                        )}
                                    </div>

                                    {/* PREMIUM PERIOD */}
                                    <div className="">
                                        <label className="font-semibold">Premium Period</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.premiumPeriod}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, premiumPeriod: e.target.value as ProtectionItem["premiumPeriod"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Guaranteed</option>
                                                <option>Reviewable</option>
                                            </select>
                                        ) : (
                                            <p>{prot.premiumPeriod}</p>
                                        )}
                                    </div>

                                    {/* PRODUCT TYPE */}
                                    <div className="">
                                        <label className="font-semibold">Product Type</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.productType}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, productType: e.target.value as ProtectionItem["productType"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Term</option>
                                                <option>Renewable</option>
                                                <option>Convertible</option>
                                            </select>
                                        ) : (
                                            <p>{prot.productType}</p>
                                        )}
                                    </div>

                                    {/* PROTECTION BASIS */}
                                    <div className="">
                                        <label className="font-semibold">Protection Basis</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.protectionBasis}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, protectionBasis: e.target.value as ProtectionItem["protectionBasis"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Level</option>
                                                <option>Increasing</option>
                                                <option>Decreasing</option>
                                            </select>
                                        ) : (
                                            <p>{prot.protectionBasis}</p>
                                        )}
                                    </div>

                                    {/* PRODUCT STATUS */}
                                    <div className="">
                                        <label className="font-semibold">Product Status</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.productStatus}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, productStatus: e.target.value as ProtectionItem["productStatus"] };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select...</option>
                                                <option>Cancelled</option>
                                                <option>Declined</option>
                                                <option>Deferred</option>
                                                <option>Lapsed</option>
                                                <option>Live</option>
                                                <option>Matured</option>
                                                <option>NTU</option>
                                                <option>Paid Up</option>
                                                <option>Pending</option>
                                                <option>Replaced</option>
                                                <option>Retain</option>
                                                <option>Surrendered</option>
                                                <option>Underwriting</option>
                                            </select>
                                        ) : (
                                            <p>
                                                <span
                                                    className={`px-2 py-[2px] rounded-sm  text-xs font-medium ${{
                                                        Cancelled: "bg-red-500 text-white",
                                                        Declined: "bg-gray-500 text-white",
                                                        Deferred: "bg-yellow-500 text-black",
                                                        Lapsed: "bg-orange-500 text-white",
                                                        Live: "bg-green-500 text-white",
                                                        Matured: "bg-blue-500 text-white",
                                                        NTU: "bg-purple-500 text-white",
                                                        "Paid Up": "bg-indigo-500 text-white",
                                                        Pending: "bg-yellow-400 text-black",
                                                        Replaced: "bg-gray-400 text-white",
                                                        Retain: "bg-teal-500 text-white",
                                                        Surrendered: "bg-pink-500 text-white",
                                                        Underwriting: "bg-purple-400 text-white",
                                                    }[prot.productStatus] || "bg-gray-300 text-white"
                                                        }`}
                                                >
                                                    {prot.productStatus || "N/A"}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* PROVIDER */}
                                    <div className="">
                                        <label className="font-semibold">Provider</label>
                                        {isEditing ? (
                                            <select
                                                value={prot.provider}
                                                onChange={e => {
                                                    const selected = providers.find(p => p.id === e.target.value);
                                                    const updated = [...protections];
                                                    updated[index] = {
                                                        ...prot,
                                                        provider: selected?.id || "",
                                                        providerName: selected?.company || ""
                                                    };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            >
                                                <option value="">Select Provider...</option>
                                                {providers.map(p => (
                                                    <option key={p.id} value={p.id}>{p.company}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p>{providers.find(p => p.id === prot.provider)?.company || "Not Assigned"}</p>
                                        )}
                                    </div>

                                    {/* PROVIDER REFERENCE */}
                                    <div className="">
                                        <label className="font-semibold">Provider Reference</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={prot.providerReference}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, providerReference: e.target.value };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            />
                                        ) : (
                                            <p>{prot.providerReference}</p>
                                        )}
                                    </div>

                                    {/* AMOUNT ASSURED */}
                                    <div className="">
                                        <label className="font-semibold">Amount Assured</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600">£</span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={prot.amountAssured}
                                                    onChange={e => {
                                                        const updated = [...protections];
                                                        updated[index] = { ...prot, amountAssured: Number(e.target.value) };
                                                        onChange("protections", updated);
                                                    }}
                                                    className="w-full p-2 pl-5 border rounded-md"
                                                />
                                            ) : (
                                                <p className="w-full p-2 pl-5">{prot.amountAssured}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* TERM */}
                                    <div className="">
                                        <label className="font-semibold">Term</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={prot.term}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, term: e.target.value };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            />
                                        ) : (
                                            <p>{prot.term}</p>
                                        )}
                                    </div>

                                    {/* PREMIUM */}
                                    <div className="">
                                        <label className="font-semibold">Premium</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600">£</span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={prot.premium}
                                                    onChange={e => {
                                                        const updated = [...protections];
                                                        updated[index] = { ...prot, premium: Number(e.target.value) };
                                                        onChange("protections", updated);
                                                    }}
                                                    className="w-full p-2 pl-5 border rounded-md"
                                                />
                                            ) : (
                                                <p className="w-full p-2 pl-5">{prot.premium}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* DATE ON RISK */}
                                    <div className="">
                                        <label className="font-semibold">Date on Risk</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={prot.dateOnRisk}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, dateOnRisk: e.target.value };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            />
                                        ) : (
                                            <p>{prot.dateOnRisk}</p>
                                        )}
                                    </div>

                                    {/* COMMISSION */}
                                    <div className="">
                                        <label className="font-semibold">Commission</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={prot.commission}
                                                onChange={e => {
                                                    const updated = [...protections];
                                                    updated[index] = { ...prot, commission: Number(e.target.value) };
                                                    onChange("protections", updated);
                                                }}
                                                className="w-full mt-1 p-2 border rounded-md"
                                            />
                                        ) : (
                                            <p>{prot.commission}</p>
                                        )}
                                    </div>

                                </div>



                            </div>
                        ))}
                    </div>


                    {/* ADD NEW PROTECTION */}
                    {isEditing && (
                        <button
                            className="px-3 py-2 bg-primary text-white rounded-md mb-3 max-w-fit"
                            onClick={() => {
                                const newProt: ProtectionItem = {
                                    _id: crypto.randomUUID(),
                                    advisor: "",
                                    // typeOfInsurance: "",
                                    provider: "",
                                    providerReference: "",
                                    amountAssured: 0,
                                    term: "",
                                    premium: 0,
                                    dateOnRisk: "",
                                    commission: 0,

                                    policyType: "Life Cover",
                                    singleOrJoint: "Single",
                                    premiumPeriod: "Guaranteed",
                                    productType: "Renewable",
                                    repaymentType: "Interest Only",
                                    protectionBasis: "Level",
                                    productStatus: "Live"
                                };
                                onChange("protections", [...protections, newProt]);
                            }}
                        >
                            + Add Protection
                        </button>
                    )}
                </FormSectionFull>
            )}



            {showBuildingContent && (
                <FormSection title="Building & Content">
                    <div>
                        <label className="font-semibold text-text-secondary">Protection Advisor</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.bandc?.advisor || ''} onChange={(e) => onSubFieldChange('bandc', 'advisor', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                {advisors.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        ) : (
                            <p className="py-2">{productDetails.bandc?.advisor || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Type of Insurance</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.bandc?.typeOfInsurance || ''} onChange={(e) => onSubFieldChange('bandc', 'typeOfInsurance', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                <option>Level term</option>
                                <option>Decreasing term</option>
                                <option>Increasing term</option>
                                <option>CIC</option>
                                <option>Income protection</option>
                                <option>FIB</option>
                            </select>
                        ) : (
                            <p className="py-2">{productDetails.bandc?.typeOfInsurance}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Provider</label>

                        {isEditing ? (
                            <select
                                disabled={!isEditing}
                                value={productDetails.bandc?.provider || ''}
                                onChange={(e) => {
                                    const selected = providers.find(l => l.id === e.target.value);
                                    if (selected) {
                                        onSubFieldChange('bandc', 'provider', selected.id);
                                        onSubFieldChange('bandc', 'providerName', selected.name); // optional
                                        // Do NOT update lenderReference here
                                    }
                                }}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            >
                                <option value="">Select Provider...</option>
                                {providers.map(l => (
                                    // <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                                    <option key={l.id} value={l.id}>{l.company}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="py-2">{providers.find(l => l.id === productDetails.bandc?.provider)?.company || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Provider Reference</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="text" value={productDetails.bandc?.providerReference || ''} onChange={(e) => onSubFieldChange('bandc', 'providerReference', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.providerReference}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Amount Assured</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="number" value={productDetails.bandc?.amountAssured || ''} onChange={(e) => onSubFieldChange('bandc', 'amountAssured', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.amountAssured}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Term</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="text" value={productDetails.bandc?.term || ''} onChange={(e) => onSubFieldChange('bandc', 'term', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.term}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Premium</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="number" value={productDetails.bandc?.premium || ''} onChange={(e) => onSubFieldChange('bandc', 'premium', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.premium}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date on Risk</label>
                        {isEditing ? (

                            <input disabled={!isEditing} type="date" value={productDetails.bandc?.dateOnRisk || ''} onChange={(e) => onSubFieldChange('bandc', 'dateOnRisk', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.dateOnRisk}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Commission</label>
                        {isEditing ? (
                            <input disabled={!isEditing} type="number" value={productDetails.bandc?.commission || ''} onChange={(e) => onSubFieldChange('bandc', 'commission', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                        ) : (
                            <p className="py-2">{productDetails.bandc?.commission}</p>
                        )}
                    </div>
                </FormSection>
            )}


        </div >
    );
};


const LimitedCompany: React.FC<{
    productDetails: ProductDetails;
    propertyValue: number;
    isEditing: boolean;
    onChange: (key: keyof ProductDetails, value: any) => void;
    onSubFieldChange: (section: Exclude<keyof ProductDetails, 'businessWritten'>, field: string, value: any) => void;
    advisors: string[];
}> = ({ productDetails, propertyValue, isEditing, onChange, onSubFieldChange, advisors }) => {

    const [directors, setDirectors] = useState<string[]>(productDetails.limitedCompany?.directors || ['']);

    useEffect(() => {
        setDirectors(productDetails.limitedCompany?.directors || ['']);
    }, [productDetails.limitedCompany?.directors]);


    const handleDirectorChange = (index: number, value: string) => {
        const newDirectors = [...directors];
        newDirectors[index] = value;
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };

    const addDirector = () => {
        const newDirectors = [...directors, ''];
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };

    const removeDirector = (indexToRemove: number) => {
        const newDirectors = directors.filter((_, index) => index !== indexToRemove);
        setDirectors(newDirectors);
        onSubFieldChange('limitedCompany', 'directors', newDirectors);
    };





    return (
        <div className="text-sm">
            <FormSection title="Details">
                <div>
                    <label className="font-semibold text-text-secondary">Company Name</label>

                    {isEditing ? (
                        <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.name || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'name', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.name || ''}
                        </p>
                    )}
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Registration Number</label>
                    {isEditing ? (
                        <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.registrationNumber || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'registrationNumber', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.registrationNumber || ''}
                        </p>
                    )}
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Company Address</label>
                    {isEditing ? (
                        <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.address || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'address', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.address || ''}
                        </p>
                    )}
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Date Established</label>
                    {isEditing ? (
                        <input disabled={!isEditing} type="date" value={productDetails.limitedCompany?.dateEstablished || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'dateEstablished', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.dateEstablished || ''}
                        </p>
                    )}
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="font-semibold text-text-secondary">Directors</label>
                    {directors.map((director, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {isEditing ? (
                                <input
                                    disabled={!isEditing}
                                    type="text"
                                    placeholder={`Director ${index + 1} Name`}
                                    value={director}
                                    onChange={(e) => handleDirectorChange(index, e.target.value)}
                                    className="w-full p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                                />
                            ) : (
                                <p>
                                    {director}
                                </p>
                            )}
                            {isEditing && directors.length > 1 && (
                                <button type="button" onClick={() => removeDirector(index)} className="text-danger p-1 rounded-full hover:bg-danger/10">
                                    {MinusIcon}
                                </button>
                            )}

                        </div>
                    ))}
                    {isEditing && <button type="button" onClick={addDirector} className="text-sm text-secondary mt-2 flex items-center gap-1">{PlusIcon} Add director</button>}
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Phone</label>
                    {isEditing ? (
                        <input disabled={!isEditing} type="tel" value={productDetails.limitedCompany?.phone || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'phone', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.phone || ''}
                        </p>
                    )}
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Email</label>
                    {isEditing ? (
                        <input disabled={!isEditing} type="email" value={productDetails.limitedCompany?.email || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'email', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    ) : (
                        <p className="py-2">
                            {productDetails.limitedCompany?.email || ''}
                        </p>
                    )}
                </div>
            </FormSection>
        </div>
    );
};




const DocumentsView: React.FC<{ client: Client }> = ({ client }) => {
    const [documents, setDocuments] = useState<Document[]>(client.documents || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch documents on mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${client.id}/documents`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const docs: Document[] = await res.json();
                setDocuments(docs);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDocuments();
    }, [client.id]);


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('authToken');
        // console.log('Token from localStorage:', token);
        if (!token) {
            alert('You must be logged in to upload documents.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('clientId', client.id);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${client.id}/documents`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Unauthorized. Please log in again.');
                } else {
                    throw new Error('Upload failed');
                }
                return;
            }

            const savedDoc: Document = await response.json();
            setDocuments(prev => [...prev, savedDoc]);
            alert(`${file.name} uploaded successfully!`);
        } catch (err) {
            console.error(err);
            alert('Failed to upload document.');
        }
    };

    // const handleDelete = async (docId: string) => {
    //     if (!window.confirm("Are you sure you want to delete this document?")) return;

    //     try {
    //         const token = localStorage.getItem('authToken'); // make sure to use the correct key
    //         if (!token) throw new Error('No token found');

    //         const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/documents/${docId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //             },
    //         });

    //         if (!response.ok) throw new Error('Failed to delete document');

    //         // Remove from local state
    //         setDocuments(prev => prev.filter(doc => doc.id !== docId));
    //         alert('Document deleted successfully!');
    //     } catch (err) {
    //         console.error(err);
    //         alert('Failed to delete document.');
    //     }
    // };

    const handleDelete = async (clientId: string, docId: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No token found');

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/clients/${clientId}/documents/${docId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to delete document');

            // Remove from local state
            setDocuments(prev => prev.filter(doc => doc.id !== docId));
            alert('Document deleted successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to delete document.');
        }
    };


    return (
        <div>
            <div className="flex justify-end mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                >
                    {PlusIcon}
                    <span>Upload Document</span>
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 font-medium text-text-secondary">File Name</th>
                            <th className="px-4 py-2 font-medium text-text-secondary">Type</th>
                            <th className="px-4 py-2 font-medium text-text-secondary">Upload Date</th>
                            <th className="px-4 py-2 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id} className="border-t">
                                <td className="px-4 py-2 font-semibold text-text-primary">

                                    {doc.fileName}
                                </td>
                                <td className="px-4 py-2">
                                    <span className="bg-gray-500/10 text-gray-600 px-2 py-0.5 text-xs rounded-full uppercase">{doc.fileType}</span>
                                </td>
                                <td className="px-4 py-2 text-text-secondary">
                                    {/* {doc.uploadDate} */}
                                    {doc.uploadDate
                                        ? new Date(doc.uploadDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}

                                </td>
                                <td className="px-4 py-2 space-x-2">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-secondary hover:underline font-semibold"
                                    >
                                        View
                                    </a>
                                    <button
                                        onClick={() => handleDelete(client.id, doc.id)}
                                        className="text-danger hover:underline font-semibold"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr className="border-t">
                                <td colSpan={4} className="text-center py-8 text-text-secondary">No documents uploaded.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AssociatedContactsEditor: React.FC<{
    productDetails?: ProductDetails;
    isEditing: boolean;
    onChange: (
        contactType: 'lender' | 'provider' | 'solicitor' | 'accountant' | 'surveyor' | 'estateAgent',
        field: keyof ProfessionalContact,
        value: string
    ) => void;
    contactsDirectory: ProfessionalContact[];
}> = ({ productDetails, isEditing, onChange }) => {

    //console.log(productDetails);

    const businessWritten = productDetails.businessWritten;

    // const showMortgage = businessWritten === 'Mortgage Only';
    // const showProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection';
    // const showBuildingContent = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';
    // const showMortgageProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';

    // Determine which sections should show
    const showMortgage = businessWritten === 'Mortgage Only' || businessWritten === 'Mortgage & Protection';


    const {
        getContactsByType,
        contactModalOpen,
        contactModalData,
        closeContactModal,
        addContact,
        updateContact,
    } = useContext(DataContext);

    const lenders = getContactsByType(ContactType.Lender);
    const solicitors = getContactsByType(ContactType.Solicitor);
    const providers = getContactsByType(ContactType.Provider);
    const accountants = getContactsByType(ContactType.Accountant);
    const surveyors = getContactsByType(ContactType.Surveyor);
    const estateAgents = getContactsByType(ContactType.EstateAgent);
    // const clinics = getContactsByType(ContactType.Clinics);

    return (
        <FormSectionNew title="">

            {/* 🟦 GLOBAL MODAL — used by all contact fields */}
            <Modal
                title={contactModalData ? "Edit Contact" : "Add New Contact"}
                isOpen={contactModalOpen}
                onClose={closeContactModal}
            >
                <NewContactForm
                    initialData={contactModalData}
                    onSubmit={async (data) => {
                        if (contactModalData) {
                            await updateContact(contactModalData.id, data);
                        } else {
                            await addContact(data);
                        }
                        closeContactModal();
                    }}
                    onCancel={closeContactModal}
                />
            </Modal>

            <ProfessionalContactField
                label="Lender"
                contact={productDetails.lender}
                contacts={lenders}
                isEditing={isEditing}
                onChange={(field, value) => onChange("lender", field, value)}
            />

            <ProfessionalContactField
                label="Solicitor"
                contact={productDetails.solicitor}
                contacts={solicitors}
                isEditing={isEditing}
                onChange={(field, value) => onChange("solicitor", field, value)}
            />

            {showMortgage && <ProfessionalContactField
                label="Provider"
                contact={productDetails.provider}
                contacts={providers}
                isEditing={isEditing}
                onChange={(field, value) => onChange("provider", field, value)}
            />}


            <ProfessionalContactField
                label="Accountant"
                contact={productDetails.accountant}
                contacts={accountants}
                isEditing={isEditing}
                onChange={(field, value) => onChange("accountant", field, value)}
            />

            <ProfessionalContactField
                label="Surveyor"
                contact={productDetails.surveyor}
                contacts={surveyors}
                isEditing={isEditing}
                onChange={(field, value) => onChange("surveyor", field, value)}
            />

            <ProfessionalContactField
                label="Estate Agent"
                contact={productDetails.estateAgent}
                contacts={estateAgents}
                isEditing={isEditing}
                onChange={(field, value) => onChange("estateAgent", field, value)}
            />
            {/* <ProfessionalContactField
                label="Clinics"
                contact={productDetails.clinics}
                contacts={clinics}
                isEditing={isEditing}
                onChange={(field, value) => onChange("clinics", field, value)}
            /> */}
        </FormSectionNew>
    );
};







const roleColors: Record<string, string> = {
    Admin: 'bg-blue-500 text-white',
    Adviser: 'bg-green-500 text-white',
    'Super Admin': 'bg-red-500 text-white',
    Other: 'bg-gray-500 text-white',
};

const NotesView: React.FC<{
    notes: Note[];
    isEditing: boolean;
    onChange: (notes: Note[]) => void;
}> = ({ notes, isEditing, onChange }) => {
    const [newNoteText, setNewNoteText] = useState('');

    const { currentUser } = useContext(DataContext);

    // console.log(currentUser.role)

    // const currentAuthor = currentUser
    //     ? `${currentUser.role} ${currentUser.name}`
    //     : 'Other Unknown';

    const currentAuthor = currentUser
        ? currentUser.role === 'Super Admin'
            ? 'Super Admin'
            : `${currentUser.role} ${currentUser.name}`
        : 'Other Unknown';


    // Extract role from currentAuthor string
    // const getRole = (author: string) => {
    //     const role = author.split(' ')[0]; // assumes format: "Role Name"
    //     return roleColors[role] ? role : 'Other';
    // };

    const getRole = (author: string) => {
        const matchedRole = Object.keys(roleColors).find(role =>
            author.startsWith(role)
        );
        return matchedRole || 'Other';
    };

    const handleNoteTextChange = (id: string, newText: string) => {
        const updatedNotes = notes.map(note => note.id === id ? { ...note, text: newText } : note);
        onChange(updatedNotes);
    };

    const handleAddNote = () => {
        if (newNoteText.trim() === '') return;
        const newNote: Note = {
            id: `note-${Date.now()}`,
            text: newNoteText.trim(),
            author: currentAuthor,
            // date: new Date().toISOString().split('T')[0],
            date: new Date().toISOString(),
        };
        onChange([newNote, ...notes]);
        setNewNoteText('');
    };

    const handleDeleteNote = (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            onChange(notes.filter(note => note.id !== id));
        }
    };

    const sortedNotes = [...notes].sort((a, b) => {
        const idA = Number(a.id.replace('note-', ''));
        const idB = Number(b.id.replace('note-', ''));
        return idB - idA; // DESC
    });

    const isOwnNote = (note: Note) => {
        return note.author === currentAuthor;
    };



    // console.log(notes.map(n => n.date));

    const formatDate = (value?: string) => {
        if (!value) return "N/A";

        // 🔥 Handle ISO + MySQL formats
        const clean = value.includes("T")
            ? value.split("T")[0]   // ISO format
            : value.split(" ")[0];  // MySQL format

        const [y, m, d] = clean.split("-");

        return `${d}/${m}/${y}`;
    };

    if (!isEditing) {
        return (
            <div>
                {notes.length > 0 ? (
                    <ul className="space-y-4">
                        {sortedNotes.map(note => {
                            const role = getRole(note.author);
                            return (
                                <li key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
                                    <p className="whitespace-pre-wrap">{note.text}</p>
                                    <p className="text-xs text-text-secondary mt-2 text-right flex justify-end items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${roleColors[role] || roleColors['Other']}`}>
                                            {role}
                                        </span>
                                        - {note.author.replace(role, '').trim()
                                        } on {formatDate(note.date)}
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-text-secondary">No notes for this client.</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Add new note */}
            <div className="border rounded-md p-4">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Add New Note</label>
                <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={3}
                    className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Type your note here..."
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleAddNote}
                        className="bg-secondary hover:bg-primary text-white font-semibold py-1 px-3 rounded-md text-sm"
                    >
                        Add Note
                    </button>
                </div>
            </div>

            {/* Editable notes */}
            {sortedNotes.map(note => {
                const role = getRole(note.author);
                return (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
                        {/* <textarea
                            value={note.text}
                            onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                            rows={3}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                        /> */}
                        {isOwnNote(note) ? (
                            <textarea
                                value={note.text}
                                onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                                rows={3}
                                className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                            />
                        ) : (
                            <p className="whitespace-pre-wrap">{note.text}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-text-secondary flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${roleColors[role] || roleColors['Other']}`}>
                                    {role}
                                </span>
                                - {note.author.replace(role, '').trim()
                                } on {note.date
                                    ? new Date(note.date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>
                            {isOwnNote(note) && (
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-xs text-danger hover:underline"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};



// const NotesView: React.FC<{
//     notes: Note[];
//     isEditing: boolean;
//     onChange: (notes: Note[]) => void;
//     currentAuthor: string;
// }> = ({ notes, isEditing, onChange, currentAuthor }) => {
//     const [newNoteText, setNewNoteText] = useState('');

//     const handleNoteTextChange = (id: string, newText: string) => {
//         const updatedNotes = notes.map(note => note.id === id ? { ...note, text: newText } : note);
//         onChange(updatedNotes);
//     };

//     const handleAddNote = () => {
//         if (newNoteText.trim() === '') return;
//         const newNote: Note = {
//             id: `note-${Date.now()}`,
//             text: newNoteText.trim(),
//             author: currentAuthor,
//             date: new Date().toISOString().split('T')[0],
//         };
//         onChange([newNote, ...notes]);
//         setNewNoteText('');
//     };

//     const handleDeleteNote = (id: string) => {
//         if (window.confirm("Are you sure you want to delete this note?")) {
//             onChange(notes.filter(note => note.id !== id));
//         }
//     };

//     if (!isEditing) {
//         return (
//             <div>
//                 {notes.length > 0 ? (
//                     <ul className="space-y-4">
//                         {notes.map(note => (
//                             <li key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
//                                 <p className="whitespace-pre-wrap">{note.text}</p>
//                                 <p className="text-xs text-text-secondary mt-2 text-right">
//                                     - {note.author} on {note.date
//                                         ? new Date(note.date).toLocaleDateString("en-GB", {
//                                             day: "2-digit",
//                                             month: "numeric",
//                                             year: "numeric",
//                                         })
//                                         : "N/A"}



//                                 </p>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p className="text-sm text-text-secondary">No notes for this client.</p>
//                 )}
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-4">
//             <div className="border rounded-md p-4">
//                 <label className="block text-sm font-semibold text-text-secondary mb-2">Add New Note</label>
//                 <textarea
//                     value={newNoteText}
//                     onChange={(e) => setNewNoteText(e.target.value)}
//                     rows={3}
//                     className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
//                     placeholder="Type your note here..."
//                 />
//                 <div className="flex justify-end mt-2">
//                     <button onClick={handleAddNote} className="bg-secondary hover:bg-primary text-white font-semibold py-1 px-3 rounded-md text-sm">Add Note</button>
//                 </div>
//             </div>

//             {notes.map(note => (
//                 <div key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
//                     <textarea
//                         value={note.text}
//                         onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
//                         rows={3}
//                         className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
//                     />
//                     <div className="flex justify-between items-center mt-2">
//                         <p className="text-xs text-text-secondary text-right">
//                             - {note.author} on                            {note.date
//                                 ? new Date(note.date).toLocaleDateString("en-GB", {
//                                     day: "2-digit",
//                                     month: "numeric",
//                                     year: "numeric",
//                                 })
//                                 : "—"}
//                         </p>
//                         <button onClick={() => handleDeleteNote(note.id)} className="text-xs text-danger hover:underline">Delete</button>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };


interface CaseWorker {
    name: string;
    phone: string;
    email: string;
    reference: string;
    profession: string;
}

interface CaseWorkerViewProps {
    caseWorker: CaseWorker;
    isEditing: boolean;
    onChange: (updated: CaseWorker) => void;
}

export const CaseWorkerView: React.FC<CaseWorkerViewProps> = ({
    caseWorker,
    isEditing,
    onChange,
}) => {

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     onChange({ ...caseWorker, [name]: value });
    // };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        onChange({ ...caseWorker, [name]: value });
    };

    return (
        <div className="space-y-4 text-sm">

            {/* ---------- VIEW MODE ---------- */}
            {!isEditing && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <strong>Name:</strong> {caseWorker.name || "—"}
                    </div>
                    <div>
                        <strong>Phone:</strong> {caseWorker.phone || "—"}
                    </div>
                    <div>
                        <strong>Email:</strong> {caseWorker.email || "—"}
                    </div>
                    <div>
                        <strong>Reference:</strong> {caseWorker.reference || "—"}
                    </div>
                    <div>
                        <strong>Profession:</strong> {caseWorker.profession || "—"}
                    </div>
                </div>
            )}

            {/* ---------- EDIT MODE ---------- */}
            {isEditing && (
                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="block mb-1 text-text-secondary font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={caseWorker.name}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-text-secondary font-medium">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={caseWorker.phone}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-text-secondary font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={caseWorker.email}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-text-secondary font-medium">Reference</label>
                        <input
                            type="text"
                            name="reference"
                            value={caseWorker.reference}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-text-secondary font-medium">
                            Profession
                        </label>

                        <select
                            name="profession"
                            value={caseWorker.profession || ""}
                            onChange={handleChange}
                            className="w-full bg-surface border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Select profession</option>
                            <option value="Solicitor">Solicitor</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Agent">Agent</option>
                            <option value="Surveyor">Surveyor</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Nurse">Nurse</option>
                        </select>
                    </div>
                </div>
            )}

        </div>
    );
};



const ClientProfileView: React.FC<{ client: Client; onBack: () => void }> = ({ client, onBack }) => {
    const { tasks, contacts, addTask, addContact, updateClient, deleteClient, updateTask, deleteTask, currentUser, teamMembers, loadClients } = useContext(DataContext);

    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState<Client>(client);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);


    const navigate = useNavigate();


    useEffect(() => {
        const fetchClient = async () => {
            try {
                const token = localStorage.getItem("token"); // or wherever you store it
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${client.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setEditedClient(data);
            } catch (err) {
                console.error("Error fetching full client:", err);
            }
        };
    }, [client?.id]);

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedClient(prev => ({ ...prev, [name]: value }));
    };

    const handleGeneralChangeNe = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'primaryAdvisorId') {
            const selected = cadvisors.find(a => a.id === value);
            setEditedClient(prev => ({
                ...prev,
                primaryAdvisor_id: value,
                primaryAdvisor: selected?.name || ""
            }));
        } else if (name === 'adminId') {
            const selected = cadmins.find(a => a.id === value);
            setEditedClient(prev => ({
                ...prev,
                admin_id: value,
                admin: selected?.name || ""
            }));
        } else {
            setEditedClient(prev => ({ ...prev, [name]: value }));
        }
    };


    const handleNumApplicantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newNum = parseInt(e.target.value, 10);
        setEditedClient(prev => {
            const currentApplicants = prev.applicants;
            let updatedApplicants: Applicant[];

            if (newNum > currentApplicants.length) {
                const numToAdd = newNum - currentApplicants.length;
                const newApplicants = Array(numToAdd).fill(null).map(() => ({ ...emptyApplicant }));
                updatedApplicants = [...currentApplicants, ...newApplicants];
            } else {
                updatedApplicants = currentApplicants.slice(0, newNum);
            }

            return {
                ...prev,
                applicants: updatedApplicants,
                applicationType: newNum > 1 ? 'Joint' : 'Single'
            };
        });
    };

    const handleApplicantChange = (index: number, field: keyof Applicant, value: any) => {
        const updatedApplicants = [...editedClient.applicants];
        updatedApplicants[index] = { ...updatedApplicants[index], [field]: value };
        setEditedClient(prev => ({ ...prev, applicants: updatedApplicants }));
    };

    const handlePropertyChange = (field: keyof PropertyDetails, value: any) => {
        setEditedClient(prev => ({
            ...prev,
            property: { ...prev.property, [field]: value }
        }));
    };

    const handleProductFieldChange = (key: keyof ProductDetails, value: any) => {
        setEditedClient(prev => ({
            ...prev,
            productDetails: {
                ...(prev.productDetails || { businessWritten: '' }),
                [key]: value
            }
        }));
    };

    const handleProductSubFieldChange = (section: Exclude<keyof ProductDetails, 'businessWritten'>, field: string, value: any) => {
        setEditedClient(prev => {
            const productDetails = prev.productDetails || { businessWritten: '' };
            const sectionData = productDetails[section] || {};

            const updatedSection = { ...sectionData, [field]: value };
            const updatedProductDetails = { ...productDetails, [section]: updatedSection };

            return { ...prev, productDetails: updatedProductDetails };
        });
    };

    const handleNotesChange = (updatedNotes: Note[]) => {
        setEditedClient(prev => ({ ...prev, notes: updatedNotes }));
    };

    const handleSave = async () => {
        try {
            const applicant1 = editedClient.applicants[0];
            const updatedCoreDetails = {
                name: `${applicant1.firstName} ${applicant1.surname}`,
                email: applicant1.email,
                phone: applicant1.mobileNumber,
            };
            const finalClient = { ...editedClient, ...updatedCoreDetails };


            // 🔹 Log primaryAdvisor before sending to API
            console.log("Final client being sent to API:", {
                primaryAdvisor_id: finalClient.primaryAdvisor_id,
                primaryAdvisor: finalClient.primaryAdvisor,
            });

            // Handle automated task creation for renewal reminder
            const originalMortgage = client.productDetails?.mortgage;
            const editedMortgage = finalClient.productDetails?.mortgage;
            if (editedMortgage?.renewalReminderDate && editedMortgage.renewalReminderDate !== originalMortgage?.renewalReminderDate) {
                const taskExists = tasks.some(t => t.clientId === finalClient.id && t.title.includes('Renewal Due'));
                if (!taskExists) {
                    await addTask({
                        title: `Renewal Due: ${finalClient.name} - ${editedMortgage.lender}`,
                        description: `Product term ending. Rate expires on ${editedMortgage.rateExpiry}.`,
                        dueDate: editedMortgage.renewalReminderDate,
                        dueTime: "09:00",
                        status: TaskStatus.Enquiry,
                        assignedTo: finalClient.primaryAdvisor,
                        assignedBy: 'System',
                        clientId: finalClient.id,
                    });
                }
            }

            // Handle automated contact creation
            const professionals: { data?: ProfessionalContact, type: ContactType }[] = [
                { data: finalClient.productDetails?.solicitor, type: ContactType.Solicitor },
                { data: finalClient.productDetails?.provider, type: ContactType.Provider },
                { data: finalClient.productDetails?.accountant, type: ContactType.Accountant },
                { data: finalClient.productDetails?.surveyor, type: ContactType.Surveyor }
            ];

            // for (const prof of professionals) {
            //     if (prof.data?.name && prof.data?.email) {
            //         const contactExists = contacts.some(c => c.email.toLowerCase() === prof.data!.email.toLowerCase());
            //         if (!contactExists) {
            //             await addContact({
            //                 name: prof.data.name,
            //                 company: prof.data.company,
            //                 email: prof.data.email,
            //                 phone: prof.data.phone,
            //                 type: prof.type,
            //             });
            //         }
            //     }
            // }

            for (const prof of professionals) {
                if (prof.data?.name && prof.data?.email) {
                    const contactExists = contacts.some(
                        (c) => c.email.toLowerCase() === prof.data!.email.toLowerCase()
                    );
                    if (!contactExists) {
                        await addContact({
                            name: prof.data.name,
                            company: prof.data.company || "",
                            email: prof.data.email,
                            phone: prof.data.phone || "",
                            type: prof.type,
                            address: prof.data.address || "",
                            notes: prof.data.notes || "",
                        });
                    }
                }
            }



            await updateClient(client.id, finalClient);
            setIsEditing(false);
            setEditedClient(finalClient);

            // ⭐ SUCCESS TOAST
            toast.success(`Client "${finalClient.name}" (${finalClient.caseReference}) updated successfully!`);
            // 🔹 Move back to Leads/Clients view
            onBack();
            loadClients();


        } catch (error) {

            // ❌ ERROR TOAST
            toast.error("Failed to update client. Please try again.");
            console.error(error);
        }


    };



    const handleCancel = () => {
        setEditedClient(client);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        // if (await deleteClient(client.id)) {
        //     onBack();
        // }

        // Confirm deletion only once, not twice
        if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
            try {
                await deleteClient(client.id);  // Calling the function that triggers the backend request
                toast.success(`Client "${client.name}" deleted successfully.`);
                onBack();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete client.');
            }
        }
    };

    const handleOpenCreateTaskModal = () => {
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
    };

    const handleOpenEditTaskModal = (task: Task) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setTaskToEdit(null);
        setIsTaskModalOpen(false);
    };

    // const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    //     if (taskToEdit) {
    //         await updateTask(taskToEdit.id, taskData);
    //     } else {
    //         await addTask(taskData);
    //     }
    //     handleCloseTaskModal();
    // };

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        const finalTaskData = {
            ...taskData,
            clientId: client.id, // ✅ always link to the current client
        };

        if (taskToEdit) {
            await updateTask(taskToEdit.id, finalTaskData);
        } else {
            await addTask(finalTaskData);
        }

        handleCloseTaskModal();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId); // 🧩 make sure DataContext has this method
                toast.success('Task deleted successfully.');
            } catch (error) {
                console.error('Error deleting task:', error);
                toast.error('Failed to delete task.');
            }
        }
    };

    // const clientTasks = tasks.filter(task => task.clientId === client.id);
    // const clientTasks = tasks.filter(task => String(task.clientId) === String(client.id));

    const clientTasks = tasks
        .filter(task => String(task.clientId) === String(client.id))
        .sort((a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        );


    const advisors = useMemo(() => teamMembers.filter(m => m.role === UserRole.Adviser).map(m => m.name), [teamMembers]);
    const admins = useMemo(() => teamMembers.filter(m => m.role === UserRole.Admin).map(m => m.name), [teamMembers]);

    const cadvisors = useMemo(
        () => teamMembers.filter(m => m.role === UserRole.Adviser).map(m => ({ id: m.id, name: m.name })),
        [teamMembers]
    );
    const cadmins = useMemo(
        () => teamMembers.filter(m => m.role === UserRole.Admin).map(m => ({ id: m.id, name: m.name })),
        [teamMembers]
    );

    const caseStatuses: CaseStatus[] = ['Enquiry', 'AIP', 'FMA Submitted', 'Offered', 'Exchanged', 'Completed', 'Renewal', 'On Risk', 'Commission Due', 'NPW', 'Other'];
    const clientStatuses: Client['status'][] = ['Active', 'Lead', 'Archived'];

    //const canDelete = currentUser && [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser.role);
    const canDelete = currentUser && [UserRole.SuperAdmin].includes(currentUser.role);


    const allApplicants = useMemo(() => {
        return editedClient?.applicants ?? [];
    }, [editedClient?.applicants]);

    console.log(editedClient);






    const tabs = [
        {
            label: 'Personal',
            content: (
                <div>
                    {isEditing && (
                        <div className="mb-6 pb-6 border-b">
                            <label className="block font-semibold text-text-secondary text-sm mb-1">Number of Applicants</label>
                            <select
                                value={editedClient.applicants.length}
                                onChange={handleNumApplicantsChange}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md bg-surface text-text-primary"
                            >
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    )}
                    {editedClient?.applicants?.length > 0 ? (
                        editedClient.applicants.map((applicant, index) => (
                            <ApplicantDetails
                                key={index}
                                applicant={applicant}
                                index={index}
                                isEditing={isEditing}
                                onChange={handleApplicantChange}
                                copyAddressFrom={index > 0 ? editedClient.applicants[0].currentAddress : undefined}
                                allApplicants={editedClient.applicants}

                            />
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary">No applicant data found.</p>
                    )}
                </div>
            )
        },
        {
            label: 'Property',
            content: <PropertyView property={editedClient.property} isEditing={isEditing} onChange={handlePropertyChange} allApplicants={allApplicants} />
        },
        {
            label: 'Product',
            content: <ProductView
                productDetails={editedClient.productDetails || { businessWritten: '' }}
                propertyValue={editedClient.property.propertyValue}
                isEditing={isEditing}
                onChange={handleProductFieldChange}
                onSubFieldChange={handleProductSubFieldChange}
                advisors={advisors}
            />,
        },
        {
            label: 'Limited Company Details',
            content: <LimitedCompany
                productDetails={editedClient.productDetails || { businessWritten: '' }}
                propertyValue={editedClient.property.propertyValue}
                isEditing={isEditing}
                onChange={handleProductFieldChange}
                onSubFieldChange={handleProductSubFieldChange}
                advisors={advisors}
            />,
        },
        {
            label: 'Documents',
            content: <DocumentsView client={editedClient} />,
        },
        {
            label: 'Associated Contacts',
            content: <AssociatedContactsEditor
                productDetails={editedClient.productDetails}
                isEditing={isEditing}
                onChange={(contactType, field, value) => handleProductSubFieldChange(contactType, field, value)}
                contactsDirectory={contacts}
            />
        },
        {
            label: 'Case worker',
            content: (
                <CaseWorkerView
                    caseWorker={editedClient.caseWorker || {
                        name: "",
                        phone: "",
                        email: "",
                        reference: "",
                        profession: "",
                    }}
                    isEditing={isEditing}
                    onChange={(updated) => {
                        setEditedClient(prev => ({
                            ...prev,
                            caseWorker: updated
                        }));
                    }}
                />
            ),
        },
        {
            label: 'Notes',
            content: <NotesView
                notes={editedClient.notes || []}
                isEditing={isEditing}
                onChange={handleNotesChange}
            // currentAuthor="Admin User" // In a real app, this would come from auth context
            />,
        },
    ];


    const caseStatusColors: Record<string, string> = {
        'Enquiry': 'bg-blue-500 text-white',
        'AIP': 'bg-yellow-400 text-black',
        'FMA Submitted': 'bg-purple-500 text-white',
        'Offered': 'bg-orange-500 text-white',
        'Exchanged': 'bg-indigo-500 text-white',
        'Completed': 'bg-green-500 text-white',
        'Renewal': 'bg-gray-600 text-white',
        'On Risk': 'bg-red-500 text-white',
        'Commission Due': 'bg-pink-500 text-white',
        'NPW': 'bg-cyan-500 text-white',
        'Other': 'bg-gray-500 text-black',
    };

    const getUserRole = (name: string): UserRole | undefined => {
        return teamMembers.find(m => m.name === name)?.role;
    };
    return (
        <div className="p-4 sm:p-8">
            <Modal title={taskToEdit ? "Edit Task" : "Create New Task"} isOpen={isTaskModalOpen} onClose={handleCloseTaskModal}>
                <NewTaskForm
                    onSubmit={handleSaveTask}
                    onCancel={handleCloseTaskModal}
                    clientId={client.id}
                    initialData={taskToEdit}
                    hideClientSelector={true}
                />
            </Modal>
            <button onClick={onBack} className="mb-6 text-sm text-secondary hover:underline">&larr; Back to Clients</button>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
                <div className="flex items-center">
                    {/* <img src={client.avatar} alt={client.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mr-4 sm:mr-6" /> */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{editedClient.name} {editedClient.applicationType === 'Joint' && `& ${editedClient.applicants[1]?.firstName} ${editedClient.applicants[1]?.surname}`}</h1>
                        {!isEditing ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {/* <span className={`px-3 py-1 text-sm rounded-full inline-block ${editedClient.status === 'Active' ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-500'}`}>
                                    {editedClient.status}
                                </span> */}
                                {editedClient.caseStatus && (
                                    <span className={`px-3 py-1 text-sm rounded-full inline-block ${caseStatusColors[editedClient.caseStatus] || 'bg-gray-200 text-black'}`}>{editedClient.caseStatus}</span>
                                    // <span className="px-3 py-1 text-sm rounded-full inline-block bg-accent/20 text-accent">
                                    //     {editedClient.caseStatus}
                                    // </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-2">
                                {/* <select name="status" value={editedClient.status} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm">
                                    {clientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select> */}


                                <select name="caseStatus" value={editedClient.caseStatus} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm">
                                    {caseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm md:text-right space-y-1 w-full md:w-auto bg-gray-50 p-3 rounded-lg border">
                    <p><strong className="text-text-secondary">Case Ref:</strong> {isEditing ? <input type="text" name="caseReference" value={editedClient.caseReference} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1" /> : editedClient.caseReference}</p>
                    {/* <p><strong className="text-text-secondary">Primary Advisor:</strong> {isEditing ? <select name="primaryAdvisor" value={editedClient.primaryAdvisor} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1">{advisors.map(a => <option key={a} value={a}>{a}</option>)}</select> : editedClient.primaryAdvisor}</p>
                    <p><strong className="text-text-secondary">Admin:</strong> {isEditing ? <select name="admin" value={editedClient.admin} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1">{admins.map(a => <option key={a} value={a}>{a}</option>)}</select> : editedClient.admin}</p> */}

                    <p className="text-text-secondary">
                        <strong>Primary Advisor:</strong>
                        {isEditing ? (
                            <select
                                name="primaryAdvisorId"
                                value={editedClient.primaryAdvisor_id || ""}
                                onChange={handleGeneralChangeNe}
                                className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1"
                            >
                                <option value="" disabled>Please select advisor</option>
                                {cadvisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        ) : (
                            editedClient.primaryAdvisor || " — "
                        )}
                    </p>

                    <p className="text-text-secondary">
                        <strong>Admin:</strong>
                        {isEditing ? (
                            // <select
                            //     name="adminId"
                            //     value={editedClient.id || ""}
                            //     onChange={handleGeneralChangeNe}
                            //     className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1"
                            // >
                            //     <option value="" disabled>Please select admin</option>
                            //     {cadmins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            // </select>
                            <select
                                name="adminId"
                                value={editedClient.admin_id || ""}
                                onChange={handleGeneralChangeNe}
                                className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1"
                            >
                                <option value="" disabled>Please select admin</option>
                                {cadmins.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            editedClient.admin || " — "
                        )}
                    </p>

                    {/* Show all admins below */}
                    {/* <p className="text-xs text-gray-500 ml-1">
                        All Admins: {admins.join(", ") || "—"}
                    </p> */}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end mb-4 gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md">Cancel</button>
                        <button onClick={handleSave} className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md">Save Changes</button>
                    </>
                ) : (
                    <>
                        <DuplicateButton
                            clientId={client.id}
                            onDuplicate={(newId) => {
                                // console.log("New client created with ID:", newId);
                                // Optionally navigate to the new client's profile
                                // navigate(`/clients/${newId}`);
                                window.location.reload();
                            }}
                        />
                        {canDelete && (
                            <button onClick={handleDelete} className="bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-2 px-4 rounded-md">Delete Client</button>
                        )}
                        <button onClick={() => setIsEditing(true)} className="bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-md">Edit Client</button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:col-span-2">
                    <Card>
                        <CardContent>
                            <Tabs tabs={tabs} />
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <span>Recent Tasks</span>
                                <button
                                    onClick={handleOpenCreateTaskModal}
                                    className="flex items-center gap-1 text-sm text-secondary font-semibold hover:text-primary transition-colors"
                                    aria-label="Create new task"
                                >
                                    {PlusIcon}
                                    <span>New Task</span>
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {clientTasks.length > 0 ? (
                                <ul className="space-y-4">
                                    {clientTasks.map(t => (
                                        <li key={t.id} className="text-sm p-3 bg-gray-50 rounded border relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* <button
                                                    onClick={() => handleOpenEditTaskModal(t)}
                                                    className="text-gray-400 hover:text-secondary p-1"
                                                    aria-label="Edit task"
                                                >
                                                    {EditIcon}
                                                </button> */}
                                                {(
                                                    currentUser?.role === UserRole.SuperAdmin ||
                                                    currentUser?.role === UserRole.Admin ||
                                                    t.assignedTo === currentUser?.name ||
                                                    t.assignedBy === currentUser?.name
                                                ) && (
                                                        <button
                                                            onClick={() => handleOpenEditTaskModal(t)}
                                                            className="text-gray-400 hover:text-secondary p-1"
                                                            aria-label="Edit task"
                                                        >
                                                            {EditIcon}
                                                        </button>
                                                    )}


                                                {/* 🗑️ Delete Button */}

                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeleteTask(t.id)}
                                                        className="text-gray-400 hover:text-danger p-1"
                                                        aria-label="Delete task"
                                                    >
                                                        <TrashIcon className="size-4 text-red-500" />
                                                    </button>
                                                )}
                                            </div>


                                            <p className="font-semibold text-text-primary pr-8">{t.title}</p>




                                            {t.description && <p className="text-xs text-text-secondary mt-1">{t.description}</p>}
                                            {/* <p className="text-xs text-text-secondary mt-2">Due: {t.dueDate}</p> */}
                                            <p className="text-xs text-text-secondary mt-2">Date:
                                                {t.dueDate
                                                    ? new Date(t.dueDate).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </p>

                                            <div className="flex items-center justify-end">
                                                {(() => {
                                                    const role = getUserRole(t.assignedBy);
                                                    const name = t.assignedBy;

                                                    // if (!role) return null;
                                                    if (role === UserRole.Adviser && name === currentUser?.name) return null;

                                                    const roleStyles = {
                                                        [UserRole.SuperAdmin]: "bg-purple-100 text-purple-700",
                                                        [UserRole.Admin]: "bg-blue-100 text-blue-700",
                                                        [UserRole.Adviser]: "bg-green-100 text-green-700",
                                                    };

                                                    const style = roleStyles[role] ?? "bg-gray-100 text-gray-700";
                                                    return (
                                                        <>
                                                            {/* <span className='text-xs font-semibold'>{name} —</span> */}
                                                            <span
                                                                className={`text-xs px-2 py-1 rounded-full ${style}`}
                                                            >
                                                                {role}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-text-secondary">No tasks for this client.</p>
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};


const CreateClientView: React.FC<{ onSubmit: (client: Omit<Client, 'id' | 'avatar'>) => void; onCancel: () => void; }> = ({ onSubmit, onCancel }) => {
    return (
        <div className="p-4 sm:p-8">
            <button onClick={onCancel} className="mb-6 text-sm text-secondary hover:underline">&larr; Back to Clients</button>
            <h1 className="text-3xl font-bold mb-2">Create New Client</h1>
            <p className="text-text-secondary mb-8">Enter the details for the new client.</p>
            <div className="max-w-4xl mx-auto bg-surface p-4 sm:p-8 rounded-lg border">
                <NewClientForm onSubmit={onSubmit} onCancel={onCancel} />
            </div>
        </div>
    );
};

export const ClientsView: React.FC = () => {
    const { clients, addClient, updateClient, selectedClientIdForNav, setSelectedClientIdForNav } = useContext(DataContext);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    const [caseStatusFilter, setCaseStatusFilter] = useState<string>(''); // '' = no filter



    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const idFromUrl = params.get("id");

        if (idFromUrl && clients.length > 0) {
            const foundClient = clients.find(c => String(c.id) === String(idFromUrl));

            if (foundClient) {
                setSelectedClient(foundClient);
            }
        }
    }, [clients]);



    useEffect(() => {
        if (selectedClientIdForNav) {
            const clientToSelect = clients.find(c => c.id === selectedClientIdForNav);
            if (clientToSelect) {
                setSelectedClient(clientToSelect);
                setSelectedClientIdForNav(null); // Reset after use
            }
        }
    }, [selectedClientIdForNav, clients, setSelectedClientIdForNav]);






    // const filteredClients = useMemo(() => {
    //     return clients.filter(client =>
    //         client.status !== 'Lead' &&
    //         (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    //     );
    // }, [searchTerm, clients]);


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

    const filteredClients = useMemo(() => {
        let result = clients.filter(client =>
            client.status !== 'Lead' &&
            (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
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




    const handleAddClient = async (client: Omit<Client, 'id' | 'avatar'>) => {
        await addClient({ ...client, status: 'Active' });
        setIsCreatingClient(false);
    };

    const handleRetrieveClient = async (client: Client) => {
        if (window.confirm(`Are you sure you want to retrieve "${client.name}"? They will be moved to the active client list.`)) {
            await updateClient(client.id, { status: 'Active' });
        }
    }

    if (selectedClient) {
        return <ClientProfileView client={selectedClient} onBack={() => setSelectedClient(null)} />;
    }

    if (isCreatingClient) {
        return (
            <CreateClientView
                onSubmit={handleAddClient}
                onCancel={() => setIsCreatingClient(false)}
            />
        );
    }

    const handleMoveToPipeline = async (client) => {
        await updateClient(client.id, { status: 'Pipeline' });
        toast.success(`${client.name} moved back to Pipeline.`);
        // fetchClients(); // ❌ remove this line
    };


    const caseStatusColors: Record<string, string> = {
        'Enquiry': 'bg-blue-500 text-white',
        'AIP': 'bg-yellow-400 text-black',
        'FMA Submitted': 'bg-purple-500 text-white',
        'Offered': 'bg-orange-500 text-white',
        'Exchanged': 'bg-indigo-500 text-white',
        'Completed': 'bg-green-500 text-white',
        'Renewal': 'bg-gray-600 text-white',
        'On Risk': 'bg-red-500 text-white',
        'Commission Due': 'bg-pink-500 text-white',
        'NPW': 'bg-cyan-500 text-white',
        'Other': 'bg-gray-500 text-black',
    };





    // console.log(filteredClients);
    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Clients</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            {SearchIcon}
                        </span>
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                        />
                    </div>
                    {/* <button
                        onClick={() => setIsCreatingClient(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        {PlusIcon}
                        <span>Create Client</span>
                    </button> */}

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={caseStatusFilter}
                            onChange={(e) => setCaseStatusFilter(e.target.value)}
                            className="bg-surface border border-gray-200 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                        >
                            <option value="">All Case Statuses</option>
                            <option value="Enquiry">Enquiry</option>
                            <option value="AIP">AIP</option>
                            <option value="FMA Submitted">FMA Submitted</option>
                            <option value="Offered">Offered</option>
                            <option value="Exchanged">Exchanged</option>
                            <option value="Completed">Completed</option>
                            <option value="Renewal">Renewal</option>
                            <option value="On Risk">On Risk</option>
                            <option value="Commission Due">Commission Due</option>
                            <option value="NPW">NPW</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
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
                            {/* <th className="px-6 py-3 font-medium text-text-secondary">Status</th> */}
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" >Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('product')}>Product <SortIcon active={sortKey === 'product'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('primaryAdvisor')}>Adviser <SortIcon active={sortKey === 'primaryAdvisor'} /></th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('lastContacted')}>Last Accessed <SortIcon active={sortKey === 'lastContacted'} /> </th>
                            <th className="px-6 py-3 font-medium text-text-secondary cursor-pointer select-none" onClick={() => handleSort('introducer')}>Introducer <SortIcon active={sortKey === 'introducer'} /> </th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.filter(client => client.status !== 'Pipeline').map(client => {

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
                                        <button onClick={() => setSelectedClient(client)} className="text-green-600 hover:underline font-semibold">View</button>
                                        {/* {client.status === 'Archived' && (
                                        <button
                                            onClick={() => handleRetrieveClient(client)}
                                            className="ml-4 text-primary hover:underline font-semibold"
                                        >
                                            Retrieve
                                        </button>
                                    )} */}



                                        {/* Show Retrieve button only for archived clients */}
                                        {/* {client.status === 'Archived' && (
                                        <button
                                            onClick={() => handleRetrieveClient(client)}
                                            className="ml-4 text-primary hover:underline font-semibold"
                                        >
                                            Retrieve
                                        </button>
                                    )} */}

                                        {/* Show Move to Pipeline button for all non-pipeline clients */}
                                        {client.status !== 'Pipeline' && (
                                            <button
                                                onClick={() => handleMoveToPipeline(client)}
                                                className="ml-4 text-secondary hover:underline font-semibold"
                                            >
                                                Move to Pipeline
                                            </button>
                                        )}

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
