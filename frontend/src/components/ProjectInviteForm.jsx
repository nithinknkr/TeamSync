import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ProjectInviteForm = ({ project, onClose }) => {
  const [formData, setFormData] = useState({
    emails: '',
    message: `You've been invited to join the project "${project.name}". Click the link below to join.`
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Process emails
      const emails = formData.emails.split(',').map(email => email.trim()).filter(email => email);
      
      if (emails.length === 0) {
        setError('Please enter at least one valid email address');
        setLoading(false);
        return;
      }
      
      // Send invites
      const response = await axios.post(
        `http://localhost:5000/api/v1/projects/${project._id}/invite`, 
        { emails, message: formData.message }, 
        config
      );
      
      setSuccess(`Invitations sent to ${emails.length} email(s) successfully!`);
      setFormData(prev => ({ ...prev, emails: '' }));
    } catch (error) {
      console.error('Invitation error:', error);
      setError(error.response?.data?.message || 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Invite to Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
              Email Addresses (comma separated)
            </label>
            <textarea
              id="emails"
              name="emails"
              rows="3"
              value={formData.emails}
              onChange={handleChange}
              placeholder="email1@example.com, email2@example.com"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Invitation Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectInviteForm;