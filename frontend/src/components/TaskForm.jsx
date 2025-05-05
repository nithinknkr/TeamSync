import { useState } from 'react';
import { format } from 'date-fns';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const TaskForm = ({ onClose, onTaskAdded, initialData = null, projects = [] }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'To Do',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
    project: initialData?.project?._id || '',
    tags: initialData?.tags?.join(', ') || ''
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
      
      // Process tags
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
      
      // Prepare data
      const taskData = {
        ...formData,
        tags,
        isPersonal: !formData.project
      };
      
      // Remove empty project field
      if (!taskData.project) delete taskData.project;
      
      let response;
      
      if (initialData) {
        // Update existing task
        response = await axios.patch(
          `http://localhost:5000/api/v1/tasks/${initialData._id}`,
          taskData,
          config
        );
      } else {
        // Create new task
        response = await axios.post('http://localhost:5000/api/v1/tasks', taskData, config);
      }
      
      onTaskAdded(response.data.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              placeholder="Task title"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              placeholder="Task description"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            >
              <option value="">Personal Task (No Project)</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              placeholder="e.g. urgent, meeting, report"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;