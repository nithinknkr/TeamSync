import { useState } from 'react';
import { format } from 'date-fns';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const SubtaskForm = ({ taskId, onClose, onSubtaskAdded, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    status: initialData?.status || 'To Do',
    dueDate: initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      let response;
      
      if (initialData) {
        // Update existing subtask
        response = await axios.patch(
          `http://localhost:5000/api/v1/tasks/${taskId}/subtasks/${initialData._id}`,
          formData,
          config
        );
      } else {
        // Create new subtask
        response = await axios.post(
          `http://localhost:5000/api/v1/tasks/${taskId}/subtasks`,
          formData,
          config
        );
      }
      
      onSubtaskAdded(response.data.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subtask. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {initialData ? 'Edit Subtask' : 'Add Subtask'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black text-sm"
            placeholder="Subtask title"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black text-sm"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black"
          >
            {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubtaskForm;