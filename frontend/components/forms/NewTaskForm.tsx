import React, { useState, useContext, useEffect } from 'react';
// import type { Task, TaskStatus } from '../../types';
import { TaskStatus, type Task } from "../../types";
import { DataContext } from '../../contexts/DataContext';

interface NewTaskFormProps {
  onSubmit: (taskData: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  initialData?: Task | null;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { clients, teamMembers, currentUser } = useContext(DataContext);




  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  // const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

  // ✅ Normalize MySQL/ISO date to "YYYY-MM-DD" for input[type=date]
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [dueDate, setDueDate] = useState(formatDateForInput(initialData?.dueDate));

  const [status, setStatus] = useState<Task['status']>(
    initialData?.status || 'Enquiry' // ✅ Default matches DB ENUM
  );
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [assignedBy, setAssignedBy] = useState(initialData?.assignedBy || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');

  // ✅ Set defaults for assignedBy / assignedTo to current logged-in advisor
  useEffect(() => {
    if (!initialData && currentUser) {
      const userName = currentUser.name || currentUser.fullName || 'Unknown User';
      setAssignedBy(userName);
      setAssignedTo(userName);
    }
  }, [initialData, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      dueDate,
      status,
      assignedTo,
      assignedBy,
      clientId: clientId || null,
    });
  };

  // ✅ Match DB ENUM status values
  // const statusOptions: Task['status'][] = [
  //   'Enquiry',
  //   'AIP',
  //   'FMA',
  //   'Offered',
  //   'Completed',
  //   'Commission Due',
  //   'NPW',
  // ];
  const statusOptions: TaskStatus[] = Object.values(TaskStatus);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 🟩 Title - full width */}
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

      {/* 🟩 Description - full width */}
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
        <label className="block text-sm font-medium mb-1">Due Date</label>
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

      {/* 🟩 Client */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Client</label>
        <select
          value={clientId || ''}
          onChange={e => setClientId(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">No Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
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
