import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import TaskDetail from '../components/TaskDetail';
import { FaPlus, FaFilter, FaCheck, FaHourglass, FaExclamationTriangle, FaLock } from 'react-icons/fa';

const TasksPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we should show the task form based on navigation state
  const initialShowTaskForm = location.state?.showTaskForm || false;
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showTaskForm, setShowTaskForm] = useState(initialShowTaskForm);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: ''
  });
  
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        // Fetch tasks and projects in parallel
        const [tasksResponse, projectsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/tasks', config),
          axios.get('http://localhost:5000/api/v1/projects', config)
        ]);
        
        setTasks(tasksResponse.data.data.tasks);
        setProjects(projectsResponse.data.data.projects);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleTaskAdded = (newTask) => {
    // If we're editing an existing task, replace it
    if (editingTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => task._id === newTask._id ? newTask : task)
      );
      setEditingTask(null);
    } else {
      // Otherwise add the new task to the list
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    setShowTaskForm(false);
  };
  
  const handleTaskUpdated = (updatedTask, editMode = false) => {
    if (editMode) {
      setEditingTask(updatedTask);
      setShowTaskForm(true);
      setSelectedTask(null);
    } else {
      setTasks(prevTasks => 
        prevTasks.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
      setSelectedTask(updatedTask);
    }
  };
  
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (filters.status && task.status !== filters.status) return false;
    
    // Apply priority filter
    if (filters.priority && task.priority !== filters.priority) return false;
    
    // Apply type filter
    if (filters.type === 'personal' && !task.isPersonal) return false;
    if (filters.type === 'project' && task.isPersonal) return false;
    
    return true;
  });
  
  // Group tasks by status for Kanban view
  const tasksByStatus = {
    'To Do': filteredTasks.filter(task => task.status === 'To Do'),
    'In Progress': filteredTasks.filter(task => task.status === 'In Progress'),
    'Blocked': filteredTasks.filter(task => task.status === 'Blocked'),
    'Completed': filteredTasks.filter(task => task.status === 'Completed')
  };
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab="tasks" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white shadow z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
              </div>
              <div className="flex items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setView('list')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      view === 'list' 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setView('kanban')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      view === 'kanban' 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Kanban View
                  </button>
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  New Task
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Task Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex items-center mb-4">
              <FaFilter className="mr-2 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  id="type-filter"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Task List View */}
          {view === 'list' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredTasks.length === 0 ? (
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
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtasks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map(task => (
                      <tr 
                        key={task._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
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
                          {task.isPersonal ? 'Personal' : 'Project'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.subtasks?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {/* Kanban View */}
          {view === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div key={status} className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      {getStatusIcon(status)}
                      <span className="ml-2">{status}</span>
                      <span className="ml-2 text-sm text-gray-500">({statusTasks.length})</span>
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {statusTasks.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No tasks</p>
                    ) : (
                      statusTasks.map(task => (
                        <div 
                          key={task._id} 
                          className="border border-gray-200 rounded-lg p-3 hover:shadow cursor-pointer bg-white"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div className="flex items-center">
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {task.subtasks.filter(st => st.status === 'Completed').length}/{task.subtasks.length} subtasks
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              {task.isPersonal ? 'Personal' : 'Project'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onTaskAdded={handleTaskAdded}
          initialData={editingTask}
          projects={projects}
        />
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default TasksPage;