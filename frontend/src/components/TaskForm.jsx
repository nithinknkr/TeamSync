import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const TaskForm = ({ onClose, onTaskAdded, initialData = null, projects = [], isProjectTask = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'To Do',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
    project: initialData?.project?._id || '',
    assignedTo: initialData?.assignedTo?._id || '',
    tags: initialData?.tags?.join(', ') || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  
  // If this is a project task form, set the project ID
  useEffect(() => {
    if (isProjectTask && projects.length === 1) {
      setFormData(prev => ({
        ...prev,
        project: projects[0]._id
      }));
      
      // Fetch project members when project is selected
      fetchProjectMembers(projects[0]._id);
    }
  }, [isProjectTask, projects]);
  
  // Fetch project members
  const fetchProjectMembers = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get(
        `http://localhost:5000/api/v1/projects/${projectId}/members`,
        config
      );
      
      setProjectMembers(response.data.data.members);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };
  
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
        isPersonal: !isProjectTask
      };
      
      // Remove project field for personal tasks
      if (!isProjectTask) {
        delete taskData.project;
      }
      
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
        response = await axios.post(
          `http://localhost:5000/api/v1/tasks/${isProjectTask ? `?projectId=${taskData.project}` : ''}`,
          taskData,
          config
        );
      }
      
      onTaskAdded(response.data.data.task);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            {initialData ? 'Edit Task' : isProjectTask ? 'Assign Project Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          {/* Only show project field if multiple projects (hidden but kept for data) */}
          {isProjectTask && projects.length > 1 && (
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={(e) => {
                  handleChange(e);
                  fetchProjectMembers(e.target.value);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Team member selection for project tasks */}
          {isProjectTask && (
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assign To Team Member *
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="">Select a team member</option>
                {projectMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. frontend, bug, feature"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
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