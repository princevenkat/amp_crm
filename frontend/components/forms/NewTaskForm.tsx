import React, { useState, useContext, useEffect, useMemo } from 'react';
import { TaskStatus, type Task } from "../../types";
import { DataContext } from '../../contexts/DataContext';
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"; // ✅ Add at the top


// interface NewTaskFormProps {
//   onSubmit: (taskData: Omit<Task, 'id'>) => void;
//   onCancel: () => void;
//   initialData?: Task | null;
// }

interface NewTaskFormProps {
  onSubmit: (taskData: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<Task> | null;
  clientId?: string;              // ✅ optional — pre-linked client (like a lead)
  hideClientSelector?: boolean;   // ✅ hide search for pipeline tasks
  statusSelector?: boolean;   // ✅ hide search for pipeline tasks

  onClientDetailsClick?: (clientId: string) => void; // ✅ NEW

  loading?: boolean;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel, initialData, clientId: propClientId,
  hideClientSelector = false, statusSelector = false, onClientDetailsClick, loading = false }) => {
  const { clients, teamMembers, currentUser } = useContext(DataContext);

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [created_at, setCreatedAt] = useState(initialData?.created_at || '');

  // const [dueDate, setDueDate] = useState(() => {
  //   if (!initialData?.dueDate) return '';
  //   const d = new Date(initialData.dueDate);
  //   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // });

  const [dueDate, setDueDate] = useState(() => {
    if (initialData?.dueDate) {
      const d = new Date(initialData.dueDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else {
      // Default to today
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  });

  // const [status, setStatus] = useState<Task['status']>(initialData?.status || 'Enquiry');

  const [status, setStatus] = useState<Task['status']>(
    initialData?.status ?? TaskStatus.Enquiry
  );
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [assignedBy, setAssignedBy] = useState(initialData?.assignedBy || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(''); // 🟥 Add error message state

  useEffect(() => {
    if (currentUser) {
      const userName = currentUser.name || 'Unknown User';
      if (!initialData || !initialData.assignedBy) setAssignedBy(userName);
      if (!initialData) setAssignedTo(userName);
    }
  }, [initialData, currentUser]);


  const normalizeTaskStatus = (value?: string): TaskStatus => {
    if (!value) return TaskStatus.Enquiry;

    // Check for enum match
    const found = Object.values(TaskStatus).find(v => v.toLowerCase() === value.toLowerCase());
    return found ?? TaskStatus.Enquiry;
  };


  // Pre-fill client info when editing a task
  // useEffect(() => {
  //   if (!initialData) return;

  //   const client = clients.find(c => c.id === initialData.clientId);

  //   // const normalizeTaskStatus = (value?: string): TaskStatus => {
  //   //   if (Object.values(TaskStatus).includes(value as TaskStatus)) {
  //   //     return value as TaskStatus;
  //   //   }
  //   //   return TaskStatus.Enquiry;
  //   // };



  //   if (client) {
  //     setClientId(client.id);
  //     setSearchTerm(`${client.name} (${client.caseReference || 'N/A'})`);

  //     setStatus(
  //       normalizeTaskStatus(
  //         client.caseStatus?.trim() || initialData?.status
  //       )
  //     );

  //   } else if (initialData.clientId) {
  //     setClientId(initialData.clientId);
  //     setSearchTerm(
  //       `${initialData.clientName || 'Unknown Client'} (${initialData.caseReference || 'N/A'})`
  //     );

  //     setStatus(
  //       normalizeTaskStatus(initialData.status)
  //     );
  //   }


  //   // if (client) {
  //   //   setClientId(client.id);
  //   //   setSearchTerm(`${client.name} (${client.caseReference || 'N/A'})`);
  //   //   setStatus(client.caseStatus?.trim() as Task['status'] || initialData.status || 'Enquiry');
  //   // } else if (initialData.clientId) {
  //   //   // Fallback: use data from initialData
  //   //   setClientId(initialData.clientId);
  //   //   setSearchTerm(`${initialData.clientName || 'Unknown Client'} (${initialData.caseReference || 'N/A'})`);
  //   //   setStatus(initialData.status || 'Enquiry');
  //   // }
  // }, [initialData, clients]);

  useEffect(() => {
    if (!initialData) return;

    const client = clients.find(c => c.id === initialData.clientId);

    if (client) {
      setClientId(client.id);
      setSearchTerm(`${client.name} (${client.caseReference || 'N/A'})`);
    } else if (initialData.clientId) {
      setClientId(initialData.clientId);
      setSearchTerm(
        `${initialData.clientName || 'Unknown Client'} (${initialData.caseReference || 'N/A'})`
      );
    }

    // ✅ ALWAYS use task status when editing
    setStatus(normalizeTaskStatus(initialData.status));
  }, [initialData, clients]);



  console.log(initialData);
  console.log(status);



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
    // if (!clientId) {
    //   setError('Please select a client before saving this task.');
    //   return;
    // }
    // if (!clientId && !hideClientSelector) {
    //   setError('Please select a client before saving this task.');
    //   return;
    // }

    onSubmit({
      title,
      description,
      dueDate,
      dueTime,
      status,
      assignedTo,
      assignedBy,
      // clientId,
      clientId: clientId || null,
    });
  };

  const statusOptions: TaskStatus[] = Object.values(TaskStatus);

  // const formatDateTime = (date?: string) => {
  //   if (!date) return "N/A";
  //   return new Date(date).toLocaleString("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const [dueTime, setDueTime] = useState(
    initialData?.dueTime || ""
  );

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">


      {/* {initialData && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md border">

          // Created At 
          <div>
            <label className="block text-sm font-medium mb-1">Created At</label>
            <input
              type="text"
              value={formatDateTime(initialData.created_at)}
              readOnly
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          //  Updated At
          <div>
            <label className="block text-sm font-medium mb-1">Last Updated</label>
            <input
              type="text"
              value={formatDateTime(initialData.updated_at)}
              readOnly
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

        </div>
      )} */}


      {/* 🔍 Search Client by Case Reference (Mandatory) */}

      {!hideClientSelector && (
        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium mb-1">
            Search Client by Case Reference
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
                  setStatus(TaskStatus.Enquiry); // reset to default
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
            // required
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

          {/* {clientId && (
            <p className="text-xs text-gray-500 mt-1">
              Selected Client: {clients.find(c => c.id === clientId)?.name || 'Unknown Client'} (
              {clients.find(c => c.id === clientId)?.caseReference || 'N/A'})
            </p>
          )} */}
        </div>

      )}






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
        <label className="block text-sm font-medium mb-1">Task</label>
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

      {/* Created At */}
      {initialData && (
        <div>
          <label className="block text-sm font-medium mb-1">Task Created</label>
          <input
            type="text"
            value={formatDate(initialData.created_at)}
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
      )}

      {/* 🟩 Due Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Task Due</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      {/* 🟩 Due Time */}
      <div>
        <label className="block text-sm font-medium mb-1">Due Time</label>
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>

      {/* 🟩 Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        {statusSelector ? (
          // 🔒 Pipeline clients — fixed "Enquiry"
          <input
            type="text"
            value="Enquiry"
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        ) : (
          // ✅ Normal clients — can select any status
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Task['status'])}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            {/* {statusOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))} */}
            {[...statusOptions]
              .sort((a, b) => a.localeCompare(b))
              .map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        )}
        {/* <select
          value={status}
          onChange={e => setStatus(e.target.value as Task['status'])}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select> */}
      </div>

      {/* 🟩 Assigned To */}
      <div>
        <label className="block text-sm font-medium mb-1">Assigned To</label>
        <select
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {/* {teamMembers.map(member => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))} */}
          {[...teamMembers]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(member => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
        </select>
      </div>

      {/* 🟩 Assigned By */}
      {/* <div>
        <label className="block text-sm font-medium mb-1">Assigned By</label>
        <input
          type="text"
          value={assignedBy}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div> */}

      {/* Assigned By */}
      <div>
        <label className="block text-sm font-medium mb-1">Assigned By</label>
        <select
          value={assignedBy}
          onChange={e => setAssignedBy(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {/* {teamMembers.map(member => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))} */}

          {[...teamMembers]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(member => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
        </select>
      </div>



      {/* 🟩 Actions */}
      {/* <div className="md:col-span-2 flex justify-end gap-3 mt-4">
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
      </div> */}
      <div className="md:col-span-2 flex justify-end gap-3 mt-4 justify-between">

        {/* Client Details Button */}
        {clientId && onClientDetailsClick && (
          <button
            type="button"
            onClick={() => onClientDetailsClick(clientId)}
            className="px-4 py-2 bg-success text-white rounded-md hover:bg-secondary"
          >
            Client Details
          </button>
        )}

        <div className='md:col-span-2 flex justify-end gap-3'><button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>

          {/* <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
          >
            {initialData ? 'Update Task' : 'Create Task'}
          </button> */}

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white 
    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}
  `}
          >
            {loading
              ? (initialData ? 'Updating...' : 'Saving...')
              : (initialData ? 'Update Task' : 'Create Task')}
          </button>

        </div>

      </div>


    </form >
  );
};
