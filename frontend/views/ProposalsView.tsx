import React, { useContext, useState } from 'react';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/ui/Icons';
import type { Proposal } from '../types';
import { DataContext } from '../contexts/DataContext';
import { Modal } from '../components/ui/Modal';
import { NewProposalForm } from '../components/forms/NewProposalForm';
import { formatCurrency } from '@/utils/formatCurrency';
import { TrashIcon } from '@heroicons/react/16/solid';

export const ProposalsView: React.FC = () => {
  const { proposals, addProposal, updateProposal, deleteProposal } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'Accepted': return 'bg-success/20 text-success';
      case 'Sent': return 'bg-accent/20 text-accent';
      case 'Draft': return 'bg-gray-400/20 text-gray-500';
      case 'Declined': return 'bg-danger/20 text-danger';
    }
  };

  const openNewProposalModal = () => {
    setEditingProposal(null);
    setIsModalOpen(true);
  };

  const openEditProposalModal = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsModalOpen(true);
  };

  const handleSubmitProposal = async (proposalData: Omit<Proposal, 'id'>) => {
    if (editingProposal) {
      // Editing existing proposal
      await updateProposal({ ...editingProposal, ...proposalData });
    } else {
      // Adding new proposal
      await addProposal(proposalData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProposal = async (id: string) => {
    if (confirm('Are you sure you want to delete this proposal?')) {
      await deleteProposal(id);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <Modal
        title={editingProposal ? "Edit Proposal" : "Create New Proposal"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <NewProposalForm
          onSubmit={handleSubmitProposal}
          onCancel={() => setIsModalOpen(false)}
          initialData={editingProposal || undefined}
        />
      </Modal>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Proposals</h1>
        <button
          onClick={openNewProposalModal}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
        >
          {PlusIcon}
          <span>New Proposal</span>
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-text-secondary">Client</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Product</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Status</th>
              <th className="px-6 py-3 font-medium text-text-secondary">Date Sent</th>
              <th className="px-6 py-3 font-medium text-text-secondary text-right">Value</th>
              <th className="px-6 py-3 font-medium text-text-secondary text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-text-primary">{p.clientName}</td>
                <td className="px-6 py-4">{p.product}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {p.sentDate
                    ? new Date(p.sentDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "numeric",
                      year: "numeric",
                    })
                    : "N/A"}

                </td>
                <td className="px-6 py-4 text-right font-semibold">
                  {formatCurrency(Math.abs(p.value))}
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button
                    onClick={() => openEditProposalModal(p)}
                    className="text-sm font-semibold text-blue-900 mr-4"
                    title="Edit Proposal"
                  >
                    {EditIcon}
                  </button>
                  <button
                    onClick={() => handleDeleteProposal(p.id)}
                    className="text-sm font-semibold text-red-500"
                    title="Delete Proposal"
                  >
                    {DeleteIcon}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};




// import React, { useContext, useState } from 'react';
// import { PlusIcon } from '../components/ui/Icons';
// import type { Proposal } from '../types';
// import { DataContext } from '../contexts/DataContext';
// import { Modal } from '../components/ui/Modal';
// import { NewProposalForm } from '../components/forms/NewProposalForm';
// import { formatCurrency } from '@/utils/formatCurrency';


// export const ProposalsView: React.FC = () => {
//   const { proposals, addProposal } = useContext(DataContext);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const getStatusColor = (status: Proposal['status']) => {
//     switch (status) {
//       case 'Accepted': return 'bg-success/20 text-success';
//       case 'Sent': return 'bg-accent/20 text-accent';
//       case 'Draft': return 'bg-gray-400/20 text-gray-500';
//       case 'Declined': return 'bg-danger/20 text-danger';
//     }
//   };

//   const handleAddProposal = async (proposal: Omit<Proposal, 'id'>) => {
//     await addProposal(proposal);
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="p-4 sm:p-8">
//       <Modal title="Create New Proposal" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <NewProposalForm onSubmit={handleAddProposal} onCancel={() => setIsModalOpen(false)} />
//       </Modal>
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
//         <h1 className="text-3xl font-bold">Proposals</h1>
//         <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto">
//           {PlusIcon}
//           <span>New Proposal</span>
//         </button>
//       </div>

//       <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-50 border-b border-gray-200">
//             <tr>
//               <th className="px-6 py-3 font-medium text-text-secondary">Client</th>
//               <th className="px-6 py-3 font-medium text-text-secondary">Product</th>
//               <th className="px-6 py-3 font-medium text-text-secondary">Status</th>
//               <th className="px-6 py-3 font-medium text-text-secondary">Date Sent</th>
//               <th className="px-6 py-3 font-medium text-text-secondary text-right">Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {proposals.map(p => (
//               <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="px-6 py-4 font-semibold text-text-primary">{p.clientName}</td>
//                 <td className="px-6 py-4">{p.product}</td>
//                 <td className="px-6 py-4">
//                   <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(p.status)}`}>
//                     {p.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">{p.sentDate}</td>
//                 <td className="px-6 py-4 text-right font-semibold">
//                   {formatCurrency(Math.abs(p.value))}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
