import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import type { Client, Contact, Task, Applicant, PropertyDetails, ProductDetails, BusinessWrittenType, ProfessionalContact, EstateAgentContact, LimitedCompanyDetails, Document, CaseStatus, Note, TeamMember } from '../types';
import { DataContext } from '../contexts/DataContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { NewClientForm } from '../components/forms/NewClientForm';
import { NewTaskForm } from '../components/forms/NewTaskForm';
import { PlusIcon, SearchIcon, MinusIcon, EditIcon } from '../components/ui/Icons';
import { ContactType, TaskStatus, UserRole } from '../types';


import { toast, Toaster, ToastBar } from 'react-hot-toast';

const emptyApplicant: Applicant = {
    title: '', firstName: '', middleName: '', surname: '', gender: '', dob: '',
    homeTelephone: '', mobileNumber: '', email: '', currentAddress: '', noOfDependents: 0, nationality: ''
};

const ApplicantDetails: React.FC<{ applicant: Applicant; index: number; isEditing: boolean; onChange: (index: number, field: keyof Applicant, value: any) => void; }> = ({ applicant, index, isEditing, onChange }) => {

    if (!isEditing) {
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Applicant {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <p><strong className="text-text-secondary">Full Name:</strong> {applicant.title} {applicant.firstName} {applicant.middleName} {applicant.surname}</p>
                    <p><strong className="text-text-secondary">Gender:</strong> {applicant.gender}</p>
                    <p><strong className="text-text-secondary">Date of Birth:</strong> {applicant.dob}</p>
                    <p><strong className="text-text-secondary">Nationality:</strong> {applicant.nationality}</p>
                    <p><strong className="text-text-secondary">Email:</strong> {applicant.email}</p>
                    <p><strong className="text-text-secondary">Mobile:</strong> {applicant.mobileNumber}</p>
                    <p><strong className="text-text-secondary">Home Tel:</strong> {applicant.homeTelephone}</p>
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

    const formFields: { name: keyof Applicant; label: string; type: string; required: boolean; fullWidth?: boolean; options?: string[] }[] = [
        { name: 'title', label: 'Title', type: 'select', required: true, options: ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof'] },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'middleName', label: 'Middle Name', type: 'text', required: false },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'homeTelephone', label: 'Home Telephone', type: 'tel', required: false },
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true },
        { name: 'currentAddress', label: 'Current Address', type: 'text', required: true, fullWidth: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'noOfDependents', label: 'No Of Dependents', type: 'number', required: true },
        { name: 'nationality', label: 'Nationality', type: 'text', required: true },
    ];

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Applicant {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formFields.map(field => (
                    <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                        <label className="block font-medium text-text-secondary mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                            <select name={field.name} value={String(applicant[field.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required}>
                                <option value="">Select...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : (
                            <input type={field.type} name={field.name} value={String(applicant[field.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" required={field.required} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PropertyView: React.FC<{ property: PropertyDetails; isEditing: boolean; onChange: (field: keyof PropertyDetails, value: any) => void; }> = ({ property, isEditing, onChange }) => {

    if (!isEditing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <p className="col-span-2"><strong className="text-text-secondary">Address:</strong> {property.address}</p>
                <p><strong className="text-text-secondary">Property Value:</strong> ${Number(property.propertyValue).toLocaleString()}</p>
                <p><strong className="text-text-secondary">Purchase Price:</strong> ${Number(property.purchasePrice).toLocaleString()}</p>
                <p><strong className="text-text-secondary">Date of Purchase:</strong> {property.dateOfPurchase}</p>
                <p><strong className="text-text-secondary">Year Built:</strong> {property.yearBuilt}</p>
                <p><strong className="text-text-secondary">Property Type:</strong> {property.propertyType}</p>
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
        { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Detached', 'Semi-detached', 'Terraced', 'Flat'] },
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
            {fields.map(f => (
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
                        <input type={f.type} name={f.name} value={String(property[f.name])} onChange={handleChange} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
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

const FormSectionNew: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h4 className="text-md font-semibold text-text-primary border-b pb-2 mb-4">{title}</h4>
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

    const { getContactsByType } = useContext(DataContext)

    const lenders = getContactsByType(ContactType.Lender);
    const solicitors = getContactsByType(ContactType.Solicitor);
    const accountants = getContactsByType(ContactType.Accountant);
    const surveyors = getContactsByType(ContactType.Surveyor);
    const estateAgents = getContactsByType(ContactType.EstateAgent);


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
    const showMortgage = businessWritten === 'Mortgage Only' || businessWritten === 'Mortgage & Protection';
    const showProtection = businessWritten === 'Protection Only' || businessWritten === 'Mortgage & Protection' || businessWritten === 'Building & Content';

    return (
        <div className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="font-semibold text-text-secondary">Business Written</label>
                    <select
                        value={productDetails.businessWritten}
                        onChange={(e) => onChange('businessWritten', e.target.value as BusinessWrittenType)}
                        className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                        disabled={!isEditing}
                    >
                        <option value="">Select...</option>
                        <option>Mortgage Only</option>
                        <option>Protection Only</option>
                        <option>Building & Content</option>
                        <option>Mortgage & Protection</option>
                    </select>
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
                            <p className="mt-1 p-2">{productDetails.mortgage?.advisor || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Type</label>
                        <select disabled={!isEditing} value={productDetails.mortgage?.mortgageType || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                            <option value="">Select...</option>
                            <option>Purchase</option>
                            <option>Remortgage with capital raising</option>
                            <option>Remortgage without Capital raising</option>
                            <option>Product switch</option>
                            <option>Further Advance</option>
                            <option>Limited Co BTL</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date of FMA</label>
                        <input disabled={!isEditing} type="date" value={productDetails.mortgage?.dateOfFMA || ''} onChange={(e) => onSubFieldChange('mortgage', 'dateOfFMA', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date Offered</label>
                        <input disabled={!isEditing} type="date" value={productDetails.mortgage?.dateOffered || ''} onChange={(e) => onSubFieldChange('mortgage', 'dateOffered', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    {/* <div>
                        <label className="font-semibold text-text-secondary">Lender</label>
                        <input disabled={!isEditing} type="text" value={productDetails.mortgage?.lender || ''} onChange={(e) => onSubFieldChange('mortgage', 'lender', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div> */}
                    <div>
                        <label className="font-semibold text-text-secondary">Lender</label>
                        {isEditing ? (
                            <select
                                disabled={!isEditing}
                                value={productDetails.mortgage?.lender || ''}
                                onChange={(e) => {
                                    const selected = lenders.find(l => l.id === e.target.value);
                                    if (selected) {
                                        onSubFieldChange('mortgage', 'lender', selected.id);
                                        onSubFieldChange('mortgage', 'lenderName', selected.name); // optional extra field if you want display name
                                        onSubFieldChange('mortgage', 'lenderReference', selected.company || '');
                                    }
                                }}
                                className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            >
                                <option value="">Select Lender...</option>
                                {lenders.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                                ))}
                            </select>
                        ) : (
                            <p className="mt-1 p-2">{lenders.find(l => l.id === productDetails.mortgage?.lender)?.name || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Lender Reference</label>
                        <input disabled={!isEditing} type="text" value={productDetails.mortgage?.lenderReference || ''} onChange={(e) => onSubFieldChange('mortgage', 'lenderReference', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <p><strong className="text-text-secondary">Property Value:</strong> ${Number(productDetails.mortgage?.propertyValue || propertyValue).toLocaleString()}</p>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Loan Amount</label>
                        <input disabled={!isEditing} type="number" value={productDetails.mortgage?.mortgageLoanAmount || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageLoanAmount', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>


                    {/* <div>
                        <label className="font-semibold text-text-secondary">Broker Fees</label>
                        <input disabled={!isEditing} type="number" value={productDetails.mortgage?.brokerFees || ''} onChange={(e) => onSubFieldChange('mortgage', 'brokerFees', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Procuration Fees</label>
                        <input disabled={!isEditing} type="number" value={productDetails.mortgage?.procurationFees || ''} onChange={(e) => onSubFieldChange('mortgage', 'procurationFees', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div> */}
                    <div>
                        <label className="font-semibold text-text-secondary">Fees</label>
                        {productDetails.mortgage?.fees?.map((fee, index) => (
                            <div key={index} className="flex items-center gap-2 mt-2">
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

                                <input
                                    disabled={!isEditing}
                                    type="number"
                                    placeholder="Amount"
                                    value={fee.amount}
                                    onChange={(e) => {
                                        const newFees = [...(productDetails.mortgage?.fees || [])];
                                        newFees[index].amount = Number(e.target.value);
                                        onSubFieldChange('mortgage', 'fees', newFees);
                                    }}
                                    className="p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100 w-1/2"
                                />

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
                        <label className="font-semibold text-text-secondary">Rate</label>
                        <input disabled={!isEditing} type="text" value={productDetails.mortgage?.rate || ''} onChange={(e) => onSubFieldChange('mortgage', 'rate', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Product Type</label>
                        <select disabled={!isEditing} value={productDetails.mortgage?.productType || ''} onChange={(e) => onSubFieldChange('mortgage', 'productType', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                            <option value="">Select...</option>
                            <option>Fixed</option>
                            <option>Variable</option>
                            <option>Discount</option>
                            <option>Capped</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-semibold text-text-secondary">Product Term</label>
                        <input disabled={!isEditing} type="text" value={productDetails.mortgage?.productTerm || ''} onChange={(e) => onSubFieldChange('mortgage', 'productTerm', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Mortgage Term</label>
                        <input disabled={!isEditing} type="text" value={productDetails.mortgage?.mortgageTerm || ''} onChange={(e) => onSubFieldChange('mortgage', 'mortgageTerm', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Rate Expiry</label>
                        <input disabled={!isEditing} type="date" value={productDetails.mortgage?.rateExpiry || ''} onChange={(e) => onSubFieldChange('mortgage', 'rateExpiry', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Renewal Reminder Date</label>
                        <input disabled={!isEditing} type="date" value={productDetails.mortgage?.renewalReminderDate || ''} onChange={(e) => onSubFieldChange('mortgage', 'renewalReminderDate', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                </FormSection>
            )}

            {showProtection && (
                <FormSection title="Protection / B&C Details">
                    <div>
                        <label className="font-semibold text-text-secondary">Protection Advisor</label>
                        {isEditing ? (
                            <select disabled={!isEditing} value={productDetails.protection?.advisor || ''} onChange={(e) => onSubFieldChange('protection', 'advisor', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                                <option value="">Select...</option>
                                {advisors.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        ) : (
                            <p className="mt-1 p-2">{productDetails.protection?.advisor || 'Not Assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Type of Insurance</label>
                        <select disabled={!isEditing} value={productDetails.protection?.typeOfInsurance || ''} onChange={(e) => onSubFieldChange('protection', 'typeOfInsurance', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100">
                            <option value="">Select...</option>
                            <option>Level term</option>
                            <option>Decreasing term</option>
                            <option>Increasing term</option>
                            <option>CIC</option>
                            <option>Income protection</option>
                            <option>FIB</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Provider</label>
                        <input disabled={!isEditing} type="text" value={productDetails.protection?.provider || ''} onChange={(e) => onSubFieldChange('protection', 'provider', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Provider Reference</label>
                        <input disabled={!isEditing} type="text" value={productDetails.protection?.providerReference || ''} onChange={(e) => onSubFieldChange('protection', 'providerReference', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Amount Assured</label>
                        <input disabled={!isEditing} type="number" value={productDetails.protection?.amountAssured || ''} onChange={(e) => onSubFieldChange('protection', 'amountAssured', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Term</label>
                        <input disabled={!isEditing} type="text" value={productDetails.protection?.term || ''} onChange={(e) => onSubFieldChange('protection', 'term', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Premium</label>
                        <input disabled={!isEditing} type="number" value={productDetails.protection?.premium || ''} onChange={(e) => onSubFieldChange('protection', 'premium', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Date on Risk</label>
                        <input disabled={!isEditing} type="date" value={productDetails.protection?.dateOnRisk || ''} onChange={(e) => onSubFieldChange('protection', 'dateOnRisk', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary">Commission</label>
                        <input disabled={!isEditing} type="number" value={productDetails.protection?.commission || ''} onChange={(e) => onSubFieldChange('protection', 'commission', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                    </div>
                </FormSection>
            )}

            <FormSectionNew title="Professional Contacts">


                {/* SOLICITOR */}
                <div className="border p-4 rounded-md">
                    <h5 className="font-bold mb-2">Solicitor</h5>
                    {isEditing ? (
                        <select
                            value={productDetails.solicitor?.id || ''}
                            onChange={(e) => {
                                const selected = solicitors.find(s => s.id === e.target.value);
                                onSubFieldChange('solicitor', 'id', selected?.id || '');
                            }}
                            className="w-full p-2 border rounded-md bg-surface text-text-primary"
                        >
                            <option value="">Select Solicitor...</option>
                            {solicitors.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.company ? `(${s.company})` : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="p-2">
                            {solicitors.find(s => s.id === productDetails.solicitor?.id)?.name || 'Not Assigned'}
                        </p>
                    )}
                </div>

                {/* ACCOUNTANT */}
                <div className="border p-4 rounded-md">
                    <h5 className="font-bold mb-2">Accountant</h5>
                    {isEditing ? (
                        <select
                            value={productDetails.accountant?.id || ''}
                            onChange={(e) => {
                                const selected = accountants.find(a => a.id === e.target.value);
                                onSubFieldChange('accountant', 'id', selected?.id || '');
                            }}
                            className="w-full p-2 border rounded-md bg-surface text-text-primary"
                        >
                            <option value="">Select Accountant...</option>
                            {accountants.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name} {a.company ? `(${a.company})` : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="p-2">
                            {accountants.find(a => a.id === productDetails.accountant?.id)?.name || 'Not Assigned'}
                        </p>
                    )}
                </div>

                {/* SURVEYOR */}
                <div className="border p-4 rounded-md">
                    <h5 className="font-bold mb-2">Surveyor</h5>
                    {isEditing ? (
                        <select
                            value={productDetails.surveyor?.id || ''}
                            onChange={(e) => {
                                const selected = surveyors.find(s => s.id === e.target.value);
                                onSubFieldChange('surveyor', 'id', selected?.id || '');
                            }}
                            className="w-full p-2 border rounded-md bg-surface text-text-primary"
                        >
                            <option value="">Select Surveyor...</option>
                            {surveyors.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.company ? `(${s.company})` : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="p-2">
                            {surveyors.find(s => s.id === productDetails.surveyor?.id)?.name || 'Not Assigned'}
                        </p>
                    )}
                </div>

                {/* ESTATE AGENT */}
                <div className="border p-4 rounded-md">
                    <h5 className="font-bold mb-2">Estate Agent</h5>
                    {isEditing ? (
                        <select
                            value={productDetails.estateAgent?.id || ''}
                            onChange={(e) => {
                                const selected = estateAgents.find(ea => ea.id === e.target.value);
                                onSubFieldChange('estateAgent', 'id', selected?.id || '');
                            }}
                            className="w-full p-2 border rounded-md bg-surface text-text-primary"
                        >
                            <option value="">Select Estate Agent...</option>
                            {estateAgents.map(ea => (
                                <option key={ea.id} value={ea.id}>
                                    {ea.company} {ea.name ? `(${ea.name})` : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="p-2">
                            {estateAgents.find(ea => ea.id === productDetails.estateAgent?.id)?.company || 'Not Assigned'}
                        </p>
                    )}
                </div>



            </FormSectionNew>

            <FormSection title="Limited Company Details">
                <div>
                    <label className="font-semibold text-text-secondary">Company Name</label>
                    <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.name || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'name', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Registration Number</label>
                    <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.registrationNumber || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'registrationNumber', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
                <div className="col-span-2">
                    <label className="font-semibold text-text-secondary">Company Address</label>
                    <input disabled={!isEditing} type="text" value={productDetails.limitedCompany?.address || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'address', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Date Established</label>
                    <input disabled={!isEditing} type="date" value={productDetails.limitedCompany?.dateEstablished || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'dateEstablished', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="font-semibold text-text-secondary">Directors</label>
                    {directors.map((director, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                disabled={!isEditing}
                                type="text"
                                placeholder={`Director ${index + 1} Name`}
                                value={director}
                                onChange={(e) => handleDirectorChange(index, e.target.value)}
                                className="w-full p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100"
                            />
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
                    <input disabled={!isEditing} type="tel" value={productDetails.limitedCompany?.phone || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'phone', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
                <div>
                    <label className="font-semibold text-text-secondary">Email</label>
                    <input disabled={!isEditing} type="email" value={productDetails.limitedCompany?.email || ''} onChange={(e) => onSubFieldChange('limitedCompany', 'email', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-surface text-text-primary disabled:bg-gray-100" />
                </div>
            </FormSection>
        </div>
    );
};

// const DocumentsView: React.FC<{ client: Client }> = ({ client }) => {
//     const [documents, setDocuments] = useState<Document[]>(client.documents || []);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     //     const file = event.target.files?.[0];
//     //     if (file) {
//     //         const newDocument: Document = {
//     //             id: `doc-${Date.now()}`,
//     //             fileName: file.name,
//     //             fileType: file.name.split('.').pop() || 'file',
//     //             uploadDate: new Date().toISOString().split('T')[0],
//     //             url: '#', // Placeholder URL
//     //         };
//     //         setDocuments(prev => [...prev, newDocument]);
//     //         alert(`${file.name} uploaded successfully!`);
//     //     }
//     // };
//     const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         try {
//             const formData = new FormData();
//             formData.append('document', file);

//             // Get the JWT from localStorage (or wherever you store it)
//             const token = localStorage.getItem('token');
//             if (!token) throw new Error('No token found');

//             const response = await fetch(`/api/clients/${client.id}/documents`, {
//                 method: 'POST',
//                 body: formData,
//                 headers: {
//                     Authorization: `Bearer ${token}`, // <-- send token here
//                 },
//             });

//             if (!response.ok) throw new Error('Upload failed');

//             const savedDoc: Document = await response.json();
//             setDocuments(prev => [...prev, savedDoc]);
//             alert(`${file.name} uploaded successfully!`);
//         } catch (err) {
//             console.error(err);
//             alert('Failed to upload document.');
//         }
//     };


//     const handleDelete = (docId: string) => {
//         if (window.confirm("Are you sure you want to delete this document?")) {
//             setDocuments(prev => prev.filter(doc => doc.id !== docId));
//         }
//     };

//     return (
//         <div>
//             <div className="flex justify-end mb-4">
//                 <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileUpload}
//                     className="hidden"
//                 />
//                 <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="flex items-center gap-2 bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
//                 >
//                     {PlusIcon}
//                     <span>Upload Document</span>
//                 </button>
//             </div>
//             <div className="overflow-x-auto border rounded-lg">
//                 <table className="min-w-full text-sm text-left">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-4 py-2 font-medium text-text-secondary">File Name</th>
//                             <th className="px-4 py-2 font-medium text-text-secondary">Type</th>
//                             <th className="px-4 py-2 font-medium text-text-secondary">Upload Date</th>
//                             <th className="px-4 py-2 font-medium text-text-secondary">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {documents.map(doc => (
//                             <tr key={doc.id} className="border-t">
//                                 <td className="px-4 py-2 font-semibold text-text-primary">{doc.fileName}</td>
//                                 <td className="px-4 py-2">
//                                     <span className="bg-gray-500/10 text-gray-600 px-2 py-0.5 text-xs rounded-full uppercase">{doc.fileType}</span>
//                                 </td>
//                                 <td className="px-4 py-2 text-text-secondary">{doc.uploadDate}</td>
//                                 <td className="px-4 py-2 space-x-2">
//                                     <button onClick={() => alert("Viewing document...")} className="text-secondary hover:underline font-semibold">View</button>
//                                     <button onClick={() => handleDelete(doc.id)} className="text-danger hover:underline font-semibold">Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                         {documents.length === 0 && (
//                             <tr className="border-t">
//                                 <td colSpan={4} className="text-center py-8 text-text-secondary">No documents uploaded.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };


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
        //console.log('Token from localStorage:', token);
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

    const handleDelete = async (docId: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            const token = localStorage.getItem('authToken'); // make sure to use the correct key
            if (!token) throw new Error('No token found');

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/documents/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

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
                                <td className="px-4 py-2 text-text-secondary">{doc.uploadDate}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-secondary hover:underline font-semibold"
                                    >
                                        View
                                    </a>
                                    <button onClick={() => handleDelete(doc.id)} className="text-danger hover:underline font-semibold">Delete</button>
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
    onChange: (contactType: 'solicitor' | 'accountant' | 'surveyor', field: keyof ProfessionalContact, value: string) => void;
}> = ({ productDetails, isEditing, onChange }) => {
    const contacts: { type: 'solicitor' | 'accountant' | 'surveyor'; label: string; data?: ProfessionalContact }[] = [
        { type: 'solicitor', label: 'Solicitor', data: productDetails?.solicitor },
        { type: 'accountant', label: 'Accountant', data: productDetails?.accountant },
        { type: 'surveyor', label: 'Surveyor', data: productDetails?.surveyor },
    ];

    if (!isEditing) {
        const hasContacts = contacts.some(c => c.data?.name);
        return (
            <ul className="space-y-4">
                {hasContacts ? (
                    contacts.filter(c => c.data?.name).map(({ type, label, data }) => (
                        <li key={type} className="p-4 bg-gray-50 rounded-md text-sm border">
                            <p className="font-semibold text-text-primary">{label}: {data!.name}</p>
                            <p className="text-text-secondary">{data!.company}</p>
                            <p className="text-text-secondary">{data!.email} | {data!.phone}</p>
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-text-secondary">No associated contacts found.</p>
                )}
            </ul>
        );
    }

    return (
        <div className="space-y-6">
            {contacts.map(({ type, label, data }) => (
                <div key={type} className="border p-4 rounded-md">
                    <h5 className="col-span-full font-bold capitalize mb-2">{label}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Name</label>
                            <input type="text" placeholder="Name" value={data?.name || ''} onChange={(e) => onChange(type, 'name', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Company</label>
                            <input type="text" placeholder="Company" value={data?.company || ''} onChange={(e) => onChange(type, 'company', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Email</label>
                            <input type="email" placeholder="Email" value={data?.email || ''} onChange={(e) => onChange(type, 'email', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block font-medium text-text-secondary mb-1">Phone</label>
                            <input type="tel" placeholder="Phone" value={data?.phone || ''} onChange={(e) => onChange(type, 'phone', e.target.value)} className="w-full bg-surface border border-gray-300 rounded-md p-2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const NotesView: React.FC<{
    notes: Note[];
    isEditing: boolean;
    onChange: (notes: Note[]) => void;
    currentAuthor: string;
}> = ({ notes, isEditing, onChange, currentAuthor }) => {
    const [newNoteText, setNewNoteText] = useState('');

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
            date: new Date().toISOString().split('T')[0],
        };
        onChange([newNote, ...notes]);
        setNewNoteText('');
    };

    const handleDeleteNote = (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            onChange(notes.filter(note => note.id !== id));
        }
    };

    if (!isEditing) {
        return (
            <div>
                {notes.length > 0 ? (
                    <ul className="space-y-4">
                        {notes.map(note => (
                            <li key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
                                <p className="whitespace-pre-wrap">{note.text}</p>
                                <p className="text-xs text-text-secondary mt-2 text-right">
                                    - {note.author} on {note.date}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-text-secondary">No notes for this client.</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
                    <button onClick={handleAddNote} className="bg-secondary hover:bg-primary text-white font-semibold py-1 px-3 rounded-md text-sm">Add Note</button>
                </div>
            </div>

            {notes.map(note => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-md text-sm border">
                    <textarea
                        value={note.text}
                        onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                        rows={3}
                        className="w-full bg-surface border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-text-secondary text-right">
                            - {note.author} on {note.date}
                        </p>
                        <button onClick={() => handleDeleteNote(note.id)} className="text-xs text-danger hover:underline">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ClientProfileView: React.FC<{ client: Client; onBack: () => void }> = ({ client, onBack }) => {
    const { tasks, contacts, addTask, addContact, updateClient, deleteClient, updateTask, currentUser, teamMembers } = useContext(DataContext);

    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState<Client>(client);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);




    // useEffect(() => {
    //     setEditedClient(client);
    // }, [client]);
    useEffect(() => {
        // Fetch the full hydrated client (includes applicants, notes, etc.)
        const fetchClient = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${client.id}`);
                const data = await res.json();
                setEditedClient(data);
            } catch (err) {
                console.error("Error fetching full client:", err);
            }
        };

        if (client?.id) fetchClient();
    }, [client?.id]);

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedClient(prev => ({ ...prev, [name]: value }));
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
        const applicant1 = editedClient.applicants[0];
        const updatedCoreDetails = {
            name: `${applicant1.firstName} ${applicant1.surname}`,
            email: applicant1.email,
            phone: applicant1.mobileNumber,
        };
        const finalClient = { ...editedClient, ...updatedCoreDetails };

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
            { data: finalClient.productDetails?.accountant, type: ContactType.Accountant },
            { data: finalClient.productDetails?.surveyor, type: ContactType.Surveyor }
        ];

        for (const prof of professionals) {
            if (prof.data?.name && prof.data?.email) {
                const contactExists = contacts.some(c => c.email.toLowerCase() === prof.data!.email.toLowerCase());
                if (!contactExists) {
                    await addContact({
                        name: prof.data.name,
                        company: prof.data.company,
                        email: prof.data.email,
                        phone: prof.data.phone,
                        type: prof.type,
                    });
                }
            }
        }


        await updateClient(client.id, finalClient);
        setIsEditing(false);
        setEditedClient(finalClient);
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

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        if (taskToEdit) {
            await updateTask(taskToEdit.id, taskData);
        } else {
            await addTask(taskData);
        }
        handleCloseTaskModal();
    };

    // const clientTasks = tasks.filter(task => task.clientId === client.id);
    const clientTasks = tasks.filter(task => String(task.clientId) === String(client.id));

    const advisors = useMemo(() => teamMembers.filter(m => m.role === UserRole.Adviser).map(m => m.name), [teamMembers]);
    const admins = useMemo(() => teamMembers.filter(m => m.role === UserRole.Admin).map(m => m.name), [teamMembers]);

    const caseStatuses: CaseStatus[] = ['Initial Enquiry', 'AIP', 'FMA Submitted', 'Offered', 'Completed', 'Renewal', ''];
    const clientStatuses: Client['status'][] = ['Active', 'Lead', 'Archived'];

    const canDelete = currentUser && [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser.role);



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
            content: <PropertyView property={editedClient.property} isEditing={isEditing} onChange={handlePropertyChange} />
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
            label: 'Documents',
            content: <DocumentsView client={editedClient} />,
        },
        {
            label: 'Associated Contacts',
            content: <AssociatedContactsEditor
                productDetails={editedClient.productDetails}
                isEditing={isEditing}
                onChange={(contactType, field, value) => handleProductSubFieldChange(contactType, field, value)}
            />
        },
        {
            label: 'Notes',
            content: <NotesView
                notes={editedClient.notes || []}
                isEditing={isEditing}
                onChange={handleNotesChange}
                currentAuthor="Admin User" // In a real app, this would come from auth context
            />,
        },
    ];

    return (
        <div className="p-4 sm:p-8">
            <Modal title={taskToEdit ? "Edit Task" : "Create New Task"} isOpen={isTaskModalOpen} onClose={handleCloseTaskModal}>
                <NewTaskForm
                    onSubmit={handleSaveTask}
                    onCancel={handleCloseTaskModal}
                    clientId={client.id}
                    initialData={taskToEdit}
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
                                <span className={`px-3 py-1 text-sm rounded-full inline-block ${editedClient.status === 'Active' ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-500'}`}>
                                    {editedClient.status}
                                </span>
                                {editedClient.caseStatus && (
                                    <span className="px-3 py-1 text-sm rounded-full inline-block bg-accent/20 text-accent">
                                        {editedClient.caseStatus}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-2">
                                <select name="status" value={editedClient.status} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm">
                                    {clientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select name="caseStatus" value={editedClient.caseStatus} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm">
                                    {caseStatuses.map(s => <option key={s} value={s}>{s || 'None'}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm md:text-right space-y-1 w-full md:w-auto bg-gray-50 p-3 rounded-lg border">
                    <p><strong className="text-text-secondary">Case Ref:</strong> {isEditing ? <input type="text" name="caseReference" value={editedClient.caseReference} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1" /> : editedClient.caseReference}</p>
                    <p><strong className="text-text-secondary">Primary Advisor:</strong> {isEditing ? <select name="primaryAdvisor" value={editedClient.primaryAdvisor} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1">{advisors.map(a => <option key={a} value={a}>{a}</option>)}</select> : editedClient.primaryAdvisor}</p>
                    <p><strong className="text-text-secondary">Admin:</strong> {isEditing ? <select name="admin" value={editedClient.admin} onChange={handleGeneralChange} className="bg-surface border border-gray-300 rounded-md p-1 text-sm ml-1">{admins.map(a => <option key={a} value={a}>{a}</option>)}</select> : editedClient.admin}</p>
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
                                                <button
                                                    onClick={() => handleOpenEditTaskModal(t)}
                                                    className="text-gray-400 hover:text-secondary p-1"
                                                    aria-label="Edit task"
                                                >
                                                    {EditIcon}
                                                </button>
                                            </div>
                                            <p className="font-semibold text-text-primary pr-8">{t.title}</p>
                                            {t.description && <p className="text-xs text-text-secondary mt-1">{t.description}</p>}
                                            <p className="text-xs text-text-secondary mt-2">Due: {t.dueDate}</p>
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

    useEffect(() => {
        if (selectedClientIdForNav) {
            const clientToSelect = clients.find(c => c.id === selectedClientIdForNav);
            if (clientToSelect) {
                setSelectedClient(clientToSelect);
                setSelectedClientIdForNav(null); // Reset after use
            }
        }
    }, [selectedClientIdForNav, clients, setSelectedClientIdForNav]);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.status !== 'Lead' &&
            (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, clients]);

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
                    <button
                        onClick={() => setIsCreatingClient(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        {PlusIcon}
                        <span>Create Client</span>
                    </button>
                </div>
            </div>
            <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Name</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Product</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Last Contacted</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.filter(client => client.status !== 'Pipeline').map(client => (
                            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center">
                                    {/* <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full mr-4" /> */}
                                    <div>
                                        <p className="font-semibold text-text-primary">{client.name}</p>
                                        <p className="text-xs text-text-secondary">{client.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${client.status === 'Active' ? 'bg-success/20 text-success' : (client.status === 'Lead' ? 'bg-warning/20 text-warning' : 'bg-gray-500/20 text-gray-500')}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{client.productDetails?.businessWritten || 'N/A'}</td>
                                <td className="px-6 py-4">{client.lastContacted}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedClient(client)} className="text-secondary hover:underline font-semibold">View</button>
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
                                            className="ml-4 text-green-600 hover:underline font-semibold"
                                        >
                                            Move to Pipeline
                                        </button>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
