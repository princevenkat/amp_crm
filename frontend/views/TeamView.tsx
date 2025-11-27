import React, { useState, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';
import type { TeamMember } from '../types';
import { UserRole } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { PlusIcon, EditIcon, MinusIcon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { NewTeamMemberForm } from '../components/forms/NewTeamMemberForm';


export const TeamView: React.FC = () => {
    const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, currentUser } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

    const canManageTeam = currentUser && [UserRole.Admin, UserRole.SuperAdmin].includes(currentUser.role);

    const handleOpenCreateModal = () => {
        setMemberToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (member: TeamMember) => {
        setMemberToEdit(member);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setMemberToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveMember = async (memberData: Omit<TeamMember, 'id' | 'avatar'>) => {
        if (memberToEdit) {
            await updateTeamMember(memberToEdit.id, memberData);
        } else {
            await addTeamMember(memberData);
        }
        handleCloseModal();
    };

    const handleDeleteMember = async (memberId: string) => {
        await deleteTeamMember(memberId);
    };

    return (
        <div className="p-4 sm:p-8">
            <Modal title={memberToEdit ? "Edit Team Member" : "New Team Member"} isOpen={isModalOpen} onClose={handleCloseModal}>
                <NewTeamMemberForm
                    onSubmit={handleSaveMember}
                    onCancel={handleCloseModal}
                    initialData={memberToEdit}
                />
            </Modal>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Team Members</h1>
                {canManageTeam && (
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                    >
                        {PlusIcon}
                        <span>New Team Member</span>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {teamMembers.map(member => (
                    <Card key={member.id} className="text-center group relative py-[40px]">
                        {/* {canManageTeam && (
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => handleOpenEditModal(member)}
                                    className="text-gray-500 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:text-secondary hover:bg-white"
                                    aria-label="Edit member"
                                >
                                    {EditIcon}
                                </button>
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="text-gray-500 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:text-danger hover:bg-white"
                                    aria-label="Delete member"
                                >
                                    {MinusIcon}
                                </button>
                            </div>
                        )} */}
                        {canManageTeam && (
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {/* ✏️ Edit button */}
                                <button
                                    onClick={() => handleOpenEditModal(member)}
                                    className="text-gray-500 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:text-secondary hover:bg-white"
                                    aria-label="Edit member"
                                >
                                    {EditIcon}
                                </button>

                                {/* 🗑️ Delete button rules:
        - Hide if currentUser is viewing themselves
        - Hide if currentUser is Admin and member is SuperAdmin
    */}
                                {currentUser?.id !== member.id &&
                                    !(currentUser?.role === UserRole.Admin && member.role === UserRole.SuperAdmin) && (
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="text-gray-500 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:text-danger hover:bg-white"
                                            aria-label="Delete member"
                                        >
                                            {MinusIcon}
                                        </button>
                                    )}
                            </div>
                        )}


                        <CardContent>
                            {/* <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4" /> */}
                            <h3 className="text-lg font-bold text-text-primary">{member.name}</h3>
                            <p className="text-sm text-primary font-normal">{member.department}</p>
                            <p className="text-sm text-secondary font-medium">{member.role}</p>
                            <p className="text-sm text-text-secondary mt-2">{member.email}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
