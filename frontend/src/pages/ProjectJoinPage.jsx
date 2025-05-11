import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Logo from '../components/Logo';

const ProjectJoinPage = () => {
  const { projectId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setDebugInfo(`Fetching project data for ID: ${projectId}`);
        
        // Get public project info (no auth required)
        const response = await axios.get(`http://localhost:5000/api/v1/projects/${projectId}/public`);
        console.log('Public project data response:', response.data);
        
        if (response.data && response.data.data && response.data.data.project) {
          const projectData = response.data.data.project;
          setProject(projectData);
          setDebugInfo(prevInfo => `${prevInfo}\nProject found: ${projectData.name}`);
          
          // If the response indicates the user is already a member, set that state
          if (projectData.isMember) {
            setAlreadyMember(true);
            setDebugInfo(prevInfo => `${prevInfo}\nUser is already a member of this project`);
          }
        } else {
          setError('Invalid project data format received from server');
          setDebugInfo(prevInfo => `${prevInfo}\nInvalid data format: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        
        // Create a more detailed error message
        let errorMsg = 'Failed to load project information. ';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMsg += `Server returned ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
          setDebugInfo(prevInfo => `${prevInfo}\nResponse error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          errorMsg += 'No response from server. Please check your network connection.';
          setDebugInfo(prevInfo => `${prevInfo}\nRequest error: No response`);
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMsg += error.message;
          setDebugInfo(prevInfo => `${prevInfo}\nSetup error: ${error.message}`);
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);
  
  // Check if we were redirected back from login
  useEffect(() => {
    // If user is authenticated and we have a project, we can try to join automatically
    if (isAuthenticated && project && !joined && !joining && !alreadyMember) {
      setDebugInfo(prevInfo => `${prevInfo}\nUser is authenticated. Checking for saved redirect.`);
      const savedRedirect = localStorage.getItem('joinRedirect');
      const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
      
      if (savedRedirect && savedRedirect.includes(`/projects/join/${projectId}`)) {
        setDebugInfo(prevInfo => `${prevInfo}\nFound saved redirect: ${savedRedirect}. Attempting auto-join.`);
        handleJoinProject();
      } else if (justLoggedIn) {
        // User just logged in - trying to join this project
        setDebugInfo(prevInfo => `${prevInfo}\nUser just logged in, attempting to join project.`);
        localStorage.removeItem('justLoggedIn');
        handleJoinProject();
      } else {
        setDebugInfo(prevInfo => `${prevInfo}\nNo matching saved redirect found: ${savedRedirect || 'none'}`);
      }
    } else {
      setDebugInfo(prevInfo => `${prevInfo}\nNot auto-joining. Auth: ${isAuthenticated}, Project: ${!!project}, Joined: ${joined}, Joining: ${joining}, Already Member: ${alreadyMember}`);
    }
  }, [isAuthenticated, project, projectId, joined, joining, alreadyMember]);
  
  const handleJoinProject = async () => {
    if (!isAuthenticated) {
      // If not logged in, redirect to login with return URL
      const redirectPath = `/login?redirect=/projects/join/${projectId}`;
      setDebugInfo(prevInfo => `${prevInfo}\nNot authenticated. Redirecting to: ${redirectPath}`);
      navigate(redirectPath);
      return;
    }
    
    try {
      setJoining(true);
      setDebugInfo(prevInfo => `${prevInfo}\nAttempting to join project ${projectId}`);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Join the project
      const response = await axios.post(
        `http://localhost:5000/api/v1/projects/${projectId}/join`,
        {},
        config
      );
      
      console.log('Join project response:', response.data);
      
      // Check if the response indicates user is already a member
      if (response.data.alreadyMember) {
        setAlreadyMember(true);
        setDebugInfo(prevInfo => `${prevInfo}\nUser is already a member of this project: ${JSON.stringify(response.data)}`);
      } else {
        setJoined(true);
        setDebugInfo(prevInfo => `${prevInfo}\nSuccessfully joined project: ${JSON.stringify(response.data)}`);
        
        // Redirect to project after a short delay only if newly joined
        setTimeout(() => {
          navigate(`/projects/${projectId}`);
        }, 2000);
      }
      
      // Clear any saved redirect
      localStorage.removeItem('joinRedirect');
      
    } catch (error) {
      console.error('Error joining project:', error);
      
      // Create detailed error message for errors
      let errorMsg = 'Failed to join project. ';
      
      if (error.response) {
        errorMsg += `Server returned ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
        setDebugInfo(prevInfo => `${prevInfo}\nJoin response error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        errorMsg += 'No response from server. Please check your network connection.';
        setDebugInfo(prevInfo => `${prevInfo}\nJoin request error: No response`);
      } else {
        errorMsg += error.message;
        setDebugInfo(prevInfo => `${prevInfo}\nJoin setup error: ${error.message}`);
      }
      
      setError(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  const navigateToProject = () => {
    navigate(`/projects/${projectId}`);
  };
  
  const showDebugInfo = process.env.NODE_ENV === 'development';
  
  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      // When leaving this page, clear any stale redirects
      localStorage.removeItem('joinRedirect');
      localStorage.removeItem('justLoggedIn');
      setDebugInfo(prevInfo => `${prevInfo}\nCleaning up localStorage variables on unmount`);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        
        {loading ? (
          <div className="mt-8 text-center">
            <p className="text-gray-500">Loading project information...</p>
          </div>
        ) : error ? (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                {showDebugInfo && debugInfo && (
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 overflow-auto max-h-32">
                    {debugInfo}
                  </pre>
                )}
                <div className="mt-4 flex space-x-4">
                  <Link to="/" className="text-sm font-medium text-black hover:text-gray-800">
                    Return to home page
                  </Link>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {alreadyMember ? 'Already a Member' : 'Join Project'}
            </h2>
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="mt-2 text-sm text-gray-500">{project.description}</p>
                )}
                
                <div className="mt-6">
                  {joined ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            You have successfully joined the project! Redirecting...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : alreadyMember ? (
                    <div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              You are already a member of this project.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={navigateToProject}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        Go to Project
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinProject}
                      disabled={joining}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      {joining ? 'Joining...' : 'Join Project'}
                    </button>
                  )}
                  
                  {!isAuthenticated && !alreadyMember && (
                    <p className="mt-4 text-sm text-gray-500">
                      You'll need to log in or create an account to join this project.
                    </p>
                  )}
                  
                  {showDebugInfo && debugInfo && (
                    <div className="mt-4 p-2 border border-gray-200 rounded">
                      <details>
                        <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                        <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 overflow-auto max-h-40 text-left">
                          {debugInfo}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectJoinPage;