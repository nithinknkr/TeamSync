import { useState } from 'react';
import { format } from 'date-fns';
import { FaFilter, FaCheck, FaHourglass, FaExclamationTriangle, FaLock } from 'react-icons/fa';

const TaskList = ({ tasks, filters, onFilterChange, projects }) => {
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  const dueDateOptions = [
    { value: '', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'project', label: 'Project' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FaCheck className="text-green-500" />;
      case 'In Progress':
        return <FaHourglass className="text-blue-500" />;
      case 'Blocked':
        return <FaLock className="text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <FaFilter className="mr-2 h-4 w-4" />
          Filters
        </button>
      </div>
      
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDate-filter" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <select
              id="dueDate-filter"
              value={filters.dueDate}
              onChange={(e) => onFilterChange('dueDate', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              {dueDateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              id="project-filter"
              value={filters.project}
              onChange={(e) => onFilterChange('project', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
              Task Type
            </label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getStatusIcon(task.status)}</span>
                      <span className="text-sm text-gray-900">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.project ? task.project.name : 'Personal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TaskList;