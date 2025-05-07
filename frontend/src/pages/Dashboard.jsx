import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import ProjectList from '../components/ProjectList';
import Calendar from '../components/Calendar';
import TaskStats from '../components/TaskStats';
// Add this import
import Header from '../components/Header';

const Dashboard = ({ activeTab: initialActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Determine active tab based on prop or path
  const [activeTab, setActiveTab] = useState(() => {
    if (initialActiveTab) return initialActiveTab;
    if (location.pathname === '/projects') return 'projects';
    if (location.pathname === '/calendar') return 'calendar';
    return 'tasks';
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    dueDate: '',
    project: '',
    type: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
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
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
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
    
    // Apply due date filter
    if (filters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      if (filters.dueDate === 'today' && taskDate.getTime() !== today.getTime()) return false;
      
      if (filters.dueDate === 'thisWeek') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        
        if (taskDate < today || taskDate > endOfWeek) return false;
      }
      
      if (filters.dueDate === 'overdue' && taskDate >= today) return false;
    }
    
    // Apply project filter
    if (filters.project && (!task.project || task.project._id !== filters.project)) return false;
    
    // Apply task type filter
    if (filters.type === 'personal' && !task.isPersonal) return false;
    if (filters.type === 'project' && task.isPersonal) return false;
    
    return true;
  });

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
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} />
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'tasks' && 'My Tasks'}
                {activeTab === 'projects' && 'My Projects'}
                {activeTab === 'calendar' && 'Calendar'}
              </h1>
              
              {/* User menu */}
              {/* ... */}
            </div>
          </header>
          
          {/* Main content area */}
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
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'tasks' && (
                  <>
                    <TaskStats tasks={tasks} />
                    <TaskList tasks={tasks} />
                  </>
                )}
                
                {activeTab === 'projects' && (
                  <ProjectList projects={projects} />
                )}
                
                {activeTab === 'calendar' && (
                  <Calendar tasks={tasks} />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;