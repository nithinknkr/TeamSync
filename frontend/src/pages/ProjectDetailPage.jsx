import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import { FaPlus, FaUsers, FaTasks, FaCalendarAlt, FaLink, FaEnvelope, FaComments } from 'react-icons/fa';
import ProjectInviteForm from '../components/ProjectInviteForm';
import { format } from 'date-fns';
// Add this import
import Header from '../components/Header';
import TaskDetail from '../components/TaskDetail';
import Chat from '../components/Chat';
import { ChatProvider } from '../contexts/ChatContext';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'members', 'overview', 'chat'
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    const fetchProjectData = async () => {
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
        
        // Fetch project details, tasks, and members in parallel
        const [projectResponse, tasksResponse, membersResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/v1/projects/${projectId}`, config),
          axios.get(`http://localhost:5000/api/v1/projects/${projectId}/tasks`, config),
          axios.get(`http://localhost:5000/api/v1/projects/${projectId}/members`, config)
        ]);
        
        setProject(projectResponse.data.data.project);
        setTasks(tasksResponse.data.data.tasks);
        setMembers(membersResponse.data.data.members);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, navigate]);
  
  const handleTaskAdded = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };
  
  const handleCopyLink = () => {
    const projectLink = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(projectLink);
    alert('Project link copied to clipboard!');
  };
  
  const handleInviteClick = () => {
    setShowInviteForm(true);
  };
  
  const isTeamLead = project?.userRole === 'Lead';
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Not Found</h2>
          <p className="text-gray-700">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="projects" />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Project Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  {isTeamLead && (
                    <>
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        <FaLink className="mr-2 h-4 w-4" />
                        Copy Link
                      </button>
                      <button
                        onClick={handleInviteClick}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        <FaEnvelope className="mr-2 h-4 w-4" />
                        Invite
                      </button>
                    </>
                  )}
                  {isTeamLead && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Assign Task
                    </button>
                  )}
                </div>
              </div>
              
              {/* Project Tabs */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`${
                      activeTab === 'tasks'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`${
                      activeTab === 'members'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Team Members
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`${
                      activeTab === 'overview'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`${
                      activeTab === 'chat'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <FaComments className="mr-1 h-4 w-4" />
                    Chat
                  </button>
                </nav>
              </div>
            </div>
          </header>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Project Tasks</h2>
                  {isTeamLead && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Assign Task
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No tasks found for this project.</p>
                      {isTeamLead && (
                        <button
                          onClick={() => setShowTaskForm(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                          <FaPlus className="mr-2 h-4 w-4" />
                          Assign First Task
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Task
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map(task => (
                          <tr key={task._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {task.assignedTo?.name || 'Unassigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                  task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {(isTeamLead || task.assignedTo?._id === currentUser.id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    setEditingTask(task);
                                    setShowTaskForm(true);
                                  }}
                                  className="text-black hover:text-gray-700 mr-3"
                                >
                                  {isTeamLead ? 'Edit' : 'Update Status'}
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  setSelectedTask(task);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                  {isTeamLead && (
                    <button
                      onClick={handleInviteClick}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <FaEnvelope className="mr-2 h-4 w-4" />
                      Invite Members
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  {members.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No team members found for this project.</p>
                      {isTeamLead && (
                        <button
                          onClick={handleInviteClick}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                          <FaEnvelope className="mr-2 h-4 w-4" />
                          Invite Team Members
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tasks Assigned
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Task Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {members.map(member => (
                          <tr key={member._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${member.role === 'Lead' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.taskCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {member.taskStatus && (
                                  <>
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                                      <span className="text-xs">{member.taskStatus.completed || 0} Done</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                                      <span className="text-xs">{member.taskStatus.inProgress || 0} In Progress</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-gray-500 mr-1"></div>
                                      <span className="text-xs">{member.taskStatus.todo || 0} To Do</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.joinedAt ? format(new Date(member.joinedAt), 'MMM dd, yyyy') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Project Stats */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Project Overview</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Project Progress</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-semibold text-gray-900">{project.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Based on {project.taskStatusCounts?.total || 0} total tasks
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Task Status</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.taskStatusCounts?.completed || 0} / {project.taskStatusCounts?.total || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">In Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.taskStatusCounts?.inProgress || 0} / {project.taskStatusCounts?.total || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">To Do</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.taskStatusCounts?.toDo || 0} / {project.taskStatusCounts?.total || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Blocked</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.taskStatusCounts?.blocked || 0} / {project.taskStatusCounts?.total || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Project Timeline</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Start Date</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">End Date</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Days Remaining</span>
                            <span className="text-sm font-medium text-gray-900">
                              {project.endDate ? 
                                Math.max(0, Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              
                {/* Team Progress */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Team Progress</h2>
                  </div>
                  
                  <div className="p-6">
                    {members.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No team members yet. Invite members to collaborate.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {members.map(member => {
                          const completedTasks = member.taskStatus?.completed || 0;
                          const totalTasks = member.taskCount || 0;
                          const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                          
                          return (
                            <div key={member._id} className="flex items-center space-x-4">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {member.taskCount || 0} tasks assigned • {member.taskStatus?.completed || 0} completed
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-gray-900">{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full" 
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  </div>
                  
                  <div className="p-6">
                    {tasks.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No recent activity. Start by creating tasks.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.slice(0, 5).map(task => (
                          <div key={task._id} className="flex items-start space-x-3">
                            <div className={`mt-0.5 h-4 w-4 rounded-full flex-shrink-0 
                              ${task.status === 'Completed' ? 'bg-green-500' : 
                                task.status === 'In Progress' ? 'bg-blue-500' : 
                                task.status === 'Blocked' ? 'bg-red-500' : 'bg-gray-300'}`}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500">
                                Assigned to {task.assignedTo?.name || 'Unassigned'} • 
                                Due {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-240px)]">
                <ChatProvider projectId={projectId}>
                  <Chat />
                </ChatProvider>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onTaskAdded={handleTaskAdded}
          onTaskUpdated={handleTaskUpdated}
          initialData={editingTask}
          projects={[project].filter(Boolean)}
          isProjectTask={true}
        />
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            setEditingTask(selectedTask);
            setSelectedTask(null);
            setShowTaskForm(true);
          }}
          canEdit={isTeamLead || selectedTask.assignedTo?._id === currentUser?.id}
        />
      )}
      
      {/* Invite Form Modal */}
      {showInviteForm && (
        <ProjectInviteForm
          project={project}
          onClose={() => setShowInviteForm(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;