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
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Get public project info (no auth required)
        const response = await axios.get(`http://localhost:5000/api/v1/projects/${projectId}/public`);
        setProject(response.data.data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project information. The project may not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);
  
  const handleJoinProject = async () => {
    if (!isAuthenticated) {
      // If not logged in, redirect to login with return URL
      navigate(`/login?redirect=/projects/join/${projectId}`);
      return;
    }
    
    try {
      setJoining(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Join the project
      await axios.post(
        `http://localhost:5000/api/v1/projects/${projectId}/join`,
        {},
        config
      );
      
      setJoined(true);
      
      // Redirect to project after a short delay
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 2000);
    } catch (error) {
      console.error('Error joining project:', error);
      setError(error.response?.data?.message || 'Failed to join project. Please try again.');
    } finally {
      setJoining(false);
    }
  };
  
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
                <p className="mt-4 text-sm">
                  <Link to="/" className="font-medium text-black hover:text-gray-800">
                    Return to home page
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join Project
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
                  ) : (
                    <button
                      onClick={handleJoinProject}
                      disabled={joining}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      {joining ? 'Joining...' : 'Join Project'}
                    </button>
                  )}
                  
                  {!isAuthenticated && (
                    <p className="mt-4 text-sm text-gray-500">
                      You'll need to log in or create an account to join this project.
                    </p>
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