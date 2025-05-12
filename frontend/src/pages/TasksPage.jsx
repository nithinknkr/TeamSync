import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import TaskDetail from '../components/TaskDetail';
import { FaPlus, FaFilter, FaCheck, FaHourglass, FaExclamationTriangle, FaLock, FaTimes } from 'react-icons/fa';
import Header from '../components/Header';

// Add these styles for drag-and-drop UI feedback
const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,
  // change background colour if dragging
  background: isDragging ? 'white' : '',
  boxShadow: isDragging ? '0 4px 6px rgba(0,0,0,0.1)' : '',
  // styles we need to apply on draggables
  ...draggableStyle
});

const getColumnStyle = isDraggingOver => ({
  background: isDraggingOver ? 'rgba(229, 231, 235, 0.5)' : '',
  borderRadius: '0.5rem',
  transition: 'background-color 0.2s ease',
});

// Simple Toast component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      // Add delay for exit animation
      setTimeout(() => {
        onClose();
      }, 300); // Match with the CSS animation duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-md shadow-lg flex items-center z-50 ${isExiting ? 'toast-exit' : 'toast-enter'}`}
    >
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }} 
        className="ml-2 text-white hover:text-gray-200"
      >
        <FaTimes />
      </button>
    </div>
  );
};

const TasksPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Since we've removed the sidebar "New Task" button, we'll just initialize this to false
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: ''
  });

  const [view, setView] = useState('list'); // 'list' or 'kanban'

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

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
    showToast('Task added successfully!');
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
    setSelectedTask(null);
    showToast('Task deleted successfully!');
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleDragStart = (start) => {
    // You can add visual feedback when dragging starts
    // e.g., highlight the source column
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = async (result) => {
    // Reset cursor
    document.body.style.cursor = 'default';
    
    const { destination, source, draggableId } = result;

    // If there's no destination or if the task was dropped back to its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the task that was dragged
    const taskId = draggableId;
    const taskToUpdate = tasks.find(task => task._id === taskId);
    
    if (!taskToUpdate) return;

    try {
      // Update the task status based on the destination column
      const newStatus = destination.droppableId;
      
      // Show optimistic UI update with visual feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus, isUpdating: true } : task
        )
      );
      
      // Make API call to update the task status
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/v1/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update with the actual response data
      handleTaskUpdated(response.data.data.task);
      
      // Show success message
      showToast(`Task moved to ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating task status:', err);
      // Revert to original state if there's an error
      setTasks(prevTasks => [...prevTasks]);
      setError('Failed to update task status. Please try again.');
      showToast('Failed to update task status', 'error');
    }
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

  // Add these helper functions before the return statement
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FaCheck className="text-green-500" />;
      case 'In Progress':
        return <FaHourglass className="text-blue-500" />;
      case 'Blocked':
        return <FaLock className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="tasks" />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
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
                      className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'list'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      List View
                    </button>
                    <button
                      onClick={() => setView('kanban')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'kanban'
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Kanban View with Drag and Drop */}
            {view === 'kanban' && (
              <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <Droppable droppableId={status} key={status}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`bg-white rounded-lg shadow transition-all duration-200 ${snapshot.isDraggingOver ? 'column-dragging-over' : ''}`}
                          style={getColumnStyle(snapshot.isDraggingOver)}
                        >
                          <div className={`p-4 border-b ${snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-white'} transition-colors duration-200`}>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              {getStatusIcon(status)}
                              <span className="ml-2">{status}</span>
                              <span className="ml-2 text-sm text-gray-500">({statusTasks.length})</span>
                            </h3>
                          </div>

                          <div className={`p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto ${snapshot.isDraggingOver ? 'bg-gray-50' : ''}`}>
                            {statusTasks.length === 0 ? (
                              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-gray-500 text-sm py-2">
                                  {snapshot.isDraggingOver ? 'Drop here to move to ' + status : 'No tasks'}
                                </p>
                              </div>
                            ) : (
                              statusTasks.map((task, index) => (
                                <Draggable 
                                  key={task._id} 
                                  draggableId={task._id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={getItemStyle(
                                        snapshot.isDragging,
                                        provided.draggableProps.style
                                      )}
                                      className={`border ${task.isUpdating ? 'border-blue-300 task-dropping' : 'border-gray-200'} 
                                        rounded-lg p-3 hover:shadow cursor-pointer bg-white
                                        ${snapshot.isDragging ? 'task-dragging' : ''}
                                        transition-all duration-200 group`}
                                      onClick={() => !snapshot.isDragging && setSelectedTask(task)}
                                    >
                                      {/* Visual indicator for dragging */}
                                      {!snapshot.isDragging && (
                                        <div className="absolute -right-2 -top-2 w-6 h-6 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                          </svg>
                                        </div>
                                      )}
                                      
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
                                      
                                      {/* This creates a clone for drag preview */}
                                      {snapshot.isDragging && (
                                        <div className="fixed top-0 left-0 w-full h-0 overflow-visible z-50 pointer-events-none">
                                          <div className="absolute top-1 left-1 p-2 bg-white border border-gray-300 rounded shadow-lg text-sm">
                                            Moving: {task.title}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </DragDropContext>
            )}
          </main>
        </div>
      
        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            onClose={() => setShowTaskForm(false)}
            onTaskAdded={handleTaskAdded}
            projects={projects}
            isProjectTask={false}
            initialData={editingTask}
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
    </div>
  );
};

export default TasksPage;