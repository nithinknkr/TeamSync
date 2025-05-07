import { useState } from 'react';
import { format } from 'date-fns';
import { FaUsers, FaTasks, FaCalendarAlt, FaLink, FaEnvelope } from 'react-icons/fa';
import ProjectForm from './ProjectForm';
import ProjectInviteForm from './ProjectInviteForm';

const ProjectList = ({ projects, onProjectAdded }) => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectClick = (project) => {
    // Navigate to project details page
    window.location.href = `/projects/${project._id}`;
  };

  const handleInviteClick = (e, project) => {
    e.stopPropagation(); // Prevent project click event
    setSelectedProject(project);
    setShowInviteForm(true);
  };

  const handleCopyLink = (e, projectId) => {
    e.stopPropagation(); // Prevent project click event
    const projectLink = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(projectLink);
    alert('Project link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">My Projects</h2>
        <button 
          onClick={() => setShowProjectForm(true)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          New Project
        </button>
      </div>
      
      <div className="overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No projects found. Create a new project to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {projects.map(project => (
              <div 
                key={project._id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-500">
                      <FaUsers className="mr-2 h-4 w-4" />
                      <span>Role: {project.userRole || 'Member'}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FaTasks className="mr-2 h-4 w-4" />
                      <span>{project.taskCount || 0} Tasks</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-2">
                    <FaCalendarAlt className="mr-2 h-4 w-4" />
                    <span>Created: {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {project.progress !== undefined && (
                    <div className="mt-2 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Project actions */}
                  {project.userRole === 'Lead' && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <button 
                        onClick={(e) => handleCopyLink(e, project._id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy project link"
                      >
                        <FaLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleInviteClick(e, project)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Invite team members"
                      >
                        <FaEnvelope className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm 
          onClose={() => setShowProjectForm(false)} 
          onProjectAdded={(newProject) => {
            if (onProjectAdded) onProjectAdded(newProject);
            setShowProjectForm(false);
          }} 
        />
      )}
      
      {/* Invite Form Modal */}
      {showInviteForm && selectedProject && (
        <ProjectInviteForm 
          project={selectedProject}
          onClose={() => {
            setShowInviteForm(false);
            setSelectedProject(null);
          }} 
        />
      )}
    </div>
  );
};

export default ProjectList;