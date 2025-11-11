import React, { useState, useContext, useEffect, useMemo } from 'react';
import { TaskStatus, type Task } from "../../types";
import { DataContext } from '../../contexts/DataContext';
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"; // ✅ Add at the top


interface NewTaskFormProps {
  onSubmit: (taskData: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  initialData?: Task | null;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { clients, teamMembers, currentUser } = useContext(DataContext);

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(() => {
    if (!initialData?.dueDate) return '';
    const d = new Date(initialData.dueDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [status, setStatus] = useState<Task['status']>(initialData?.status || 'Enquiry');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [assignedBy, setAssignedBy] = useState(initialData?.assignedBy || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(''); // 🟥 Add error message state

  useEffect(() => {
    if (currentUser) {
      const userName = currentUser.name || currentUser.fullName || 'Unknown User';
      if (!initialData || !initialData.assignedBy) setAssignedBy(userName);
      if (!initialData) setAssignedTo(userName);
    }
  }, [initialData, currentUser]);

  // ✅ Pre-fill case reference + client name when editing
  useEffect(() => {
    if (initialData?.clientId && clients.length > 0) {
      const client = clients.find(c => c.id === initialData.clientId);
      if (client) {
        setClientId(client.id);
        setSearchTerm(`${client.name} (${client.caseReference || 'N/A'})`);
        setStatus(client.caseStatus?.trim() as Task['status'] || 'Enquiry');
      }
    }
  }, [initialData, clients]);


  // 🧩 Filter + handleClientSelect same as before ...
  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return [];
    return clients.filter(
      c =>
        c.caseReference?.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const handleClientSelect = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    setClientId(id);
    setSearchTerm(`${client.name} (${client.caseReference || 'N/A'})`);
    setShowSuggestions(false);
    setError(''); // ✅ Clear error once client selected

    if (client.caseStatus) {
      setStatus(client.caseStatus.trim() as Task['status']);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🟥 Prevent submission if no client selected
    if (!clientId) {
      setError('Please select a client before saving this task.');
      return;
    }

    onSubmit({
      title,
      description,
      dueDate,
      status,
      assignedTo,
      assignedBy,
      clientId,
    });
  };

  const statusOptions: TaskStatus[] = Object.values(TaskStatus);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      {/* 🔍 Search Client by Case Reference (Mandatory) */}


      <div className="md:col-span-2 relative">
        <label className="block text-sm font-medium mb-1">
          Search Client by Case Reference <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          {/* 🔍 Show search icon only if field is editable */}
          {!initialData?.id && (
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none"
            />
          )}

          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              const value = e.target.value;
              setSearchTerm(value);

              // ✅ Only show suggestions when creating new task
              if (!initialData?.id) setShowSuggestions(true);

              if (value.trim() === '') {
                setClientId('');
                setStatus('Enquiry'); // reset to default
                setError('');
              } else if (error) {
                setError('');
              }
            }}
            placeholder="Type case reference or client name..."
            className={`w-full border rounded-md p-2 ${!initialData?.id ? 'pl-9' : ''} 
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${initialData?.id ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
            readOnly={!!initialData?.id} // ✅ read-only only when editing
            required
          />
        </div>

        {/* ✅ Only show dropdown for new task */}
        {!initialData?.id && showSuggestions && filteredClients.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md w-full mt-1 max-h-48 overflow-y-auto">
            {filteredClients.map(client => (
              <li
                key={client.id}
                onClick={() => handleClientSelect(client.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                <span className="font-medium">{client.caseReference}</span> — {client.name} ({client.caseStatus})
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

        {clientId && (
          <p className="text-xs text-gray-500 mt-1">
            Selected Client: {clients.find(c => c.id === clientId)?.name} (
            {clients.find(c => c.id === clientId)?.caseReference})
          </p>
        )}
      </div>




      {/* <div className="md:col-span-2 relative">
        <label className="block text-sm font-medium mb-1">
          Search Client by Case Reference <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              const value = e.target.value;
              setSearchTerm(value);
              setShowSuggestions(true);

              // 🧠 If user clears the field, also clear selected client, status, and error
              if (value.trim() === '') {
                setClientId('');
                setStatus('Enquiry'); // ✅ Reset status to default
                setError('');
              } else if (error) {
                setError('');
              }
            }}
            placeholder="Type case reference or client name..."
            className={`w-full border rounded-md p-2 pl-9 ${error ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
        </div>

        {showSuggestions && filteredClients.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md w-full mt-1 max-h-48 overflow-y-auto">
            {filteredClients.map(client => (
              <li
                key={client.id}
                onClick={() => handleClientSelect(client.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                <span className="font-medium">{client.caseReference}</span> — {client.name} ({client.caseStatus})
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

        {clientId && searchTerm.trim() !== '' && (
          <p className="text-xs text-gray-500 mt-1">
            Selected Client:{' '}
            {clients.find(c => c.id === clientId)?.name} (
            {clients.find(c => c.id === clientId)?.caseReference})
          </p>
        )}
      </div> */}

      {/* 🟩 Title */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* 🟩 Description */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
          rows={3}
        />
      </div>

      {/* 🟩 Due Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* 🟩 Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as Task['status'])}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* 🟩 Assigned To */}
      <div>
        <label className="block text-sm font-medium mb-1">Assigned To</label>
        <select
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {teamMembers.map(member => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🟩 Assigned By */}
      <div>
        <label className="block text-sm font-medium mb-1">Assigned By</label>
        <input
          type="text"
          value={assignedBy}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>



      {/* 🟩 Actions */}
      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};



// import React, { useState, useContext, useEffect } from 'react';
// // import type { Task, TaskStatus } from '../../types';
// import { TaskStatus, type Task } from "../../types";
// import { DataContext } from '../../contexts/DataContext';

// interface NewTaskFormProps {
//   onSubmit: (taskData: Omit<Task, 'id'>) => void;
//   onCancel: () => void;
//   initialData?: Task | null;
// }

// export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
//   const { clients, teamMembers, currentUser } = useContext(DataContext);




//   const [title, setTitle] = useState(initialData?.title || '');
//   const [description, setDescription] = useState(initialData?.description || '');
//   // const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

//   // ✅ Normalize MySQL/ISO date to "YYYY-MM-DD" for input[type=date]
//   const formatDateForInput = (dateStr?: string) => {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   const [dueDate, setDueDate] = useState(formatDateForInput(initialData?.dueDate));

//   const [status, setStatus] = useState<Task['status']>(
//     initialData?.status || 'Enquiry' // ✅ Default matches DB ENUM
//   );
//   const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
//   const [assignedBy, setAssignedBy] = useState(initialData?.assignedBy || '');
//   const [clientId, setClientId] = useState(initialData?.clientId || '');

//   // ✅ Set defaults for assignedBy / assignedTo to current logged-in advisor
//   // useEffect(() => {
//   //   if (!initialData && currentUser) {
//   //     const userName = currentUser.name || currentUser.fullName || 'Unknown User';
//   //     setAssignedBy(userName);
//   //     setAssignedTo(userName);
//   //   }
//   // }, [initialData, currentUser]);


//   useEffect(() => {
//     if (currentUser) {
//       const userName = currentUser.name || currentUser.fullName || 'Unknown User';
//       // only set if not already filled (avoid overwriting when editing)
//       if (!initialData || !initialData.assignedBy) {
//         setAssignedBy(userName);
//       }
//       // for new tasks, also assign to current user
//       if (!initialData) {
//         setAssignedTo(userName);
//       }
//     }
//   }, [initialData, currentUser]);


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit({
//       title,
//       description,
//       dueDate,
//       status,
//       assignedTo,
//       assignedBy,
//       clientId: clientId || null,
//     });
//   };

//   // ✅ Match DB ENUM status values
//   // const statusOptions: Task['status'][] = [
//   //   'Enquiry',
//   //   'AIP',
//   //   'FMA',
//   //   'Offered',
//   //   'Completed',
//   //   'Commission Due',
//   //   'NPW',
//   // ];
//   const statusOptions: TaskStatus[] = Object.values(TaskStatus);

//   return (
//     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {/* 🟩 Title - full width */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium mb-1">Title</label>
//         <input
//           type="text"
//           value={title}
//           onChange={e => setTitle(e.target.value)}
//           required
//           className="w-full border border-gray-300 rounded-md p-2"
//         />
//       </div>

//       {/* 🟩 Description - full width */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium mb-1">Description</label>
//         <textarea
//           value={description}
//           onChange={e => setDescription(e.target.value)}
//           className="w-full border border-gray-300 rounded-md p-2"
//           rows={3}
//         />
//       </div>

//       {/* 🟩 Due Date */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Due Date</label>
//         <input
//           type="date"
//           value={dueDate}
//           onChange={e => setDueDate(e.target.value)}
//           required
//           className="w-full border border-gray-300 rounded-md p-2"
//         />
//       </div>

//       {/* 🟩 Status */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Status</label>
//         <select
//           value={status}
//           onChange={e => setStatus(e.target.value as Task['status'])}
//           className="w-full border border-gray-300 rounded-md p-2"
//         >
//           {statusOptions.map(option => (
//             <option key={option} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* 🟩 Assigned To */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Assigned To</label>
//         <select
//           value={assignedTo}
//           onChange={e => setAssignedTo(e.target.value)}
//           className="w-full border border-gray-300 rounded-md p-2"
//         >
//           {teamMembers.map(member => (
//             <option key={member.id} value={member.name}>
//               {member.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* 🟩 Assigned By */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Assigned By</label>
//         <input
//           type="text"
//           value={assignedBy}
//           readOnly
//           className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
//         />
//       </div>

//       {/* 🟩 Client */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium mb-1">Client</label>
//         <select
//           value={clientId || ''}
//           onChange={e => setClientId(e.target.value)}
//           className="w-full border border-gray-300 rounded-md p-2"
//         >
//           <option value="">No Client</option>
//           {clients.map(client => (
//             <option key={client.id} value={client.id}>
//               {client.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* 🟩 Actions */}
//       <div className="md:col-span-2 flex justify-end gap-3 mt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
//         >
//           {initialData ? 'Update Task' : 'Create Task'}
//         </button>
//       </div>
//     </form>
//   );

// };
