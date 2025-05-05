import { useState } from 'react';
import { format } from 'date-fns';
import { FaTimes, FaEdit, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import SubtaskForm from './SubtaskForm';

const TaskDetail = ({ task, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `http://localhost:5000/api/v1/tasks/${task._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onTaskUpdated(response.data.data.task);
    } catch (err) {
      setError('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/v1/tasks/${task._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      setError('Failed to delete task');
      setLoading(false);
    }
  };
  
  const handleSubtaskStatusChange = async (subtaskId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `http://localhost:5000/api/v1/tasks/${task._id}/subtasks/${subtaskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onTaskUpdated(response.data.data.task);
    } catch (err) {
      setError('Failed to update subtask status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/v1/tasks/${task._id}/subtasks/${subtaskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If we get a 204 No Content response, we need to fetch the updated task
      if (response.status === 204) {
        const updatedTaskResponse = await axios.get(
          `http://localhost:5000/api/v1/tasks/${task._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onTaskUpdated(updatedTaskResponse.data.data.task);
      } else {
        onTaskUpdated(response.data.data.task);
      }
    } catch (err) {
      setError('Failed to delete subtask');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority) => {
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onTaskUpdated(task, true)} // Pass true to indicate edit mode
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Edit Task"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-2 text-red-500 hover:text-red-700"
              title="Delete Task"
              disabled={loading}
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        {task.description && (
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <div className="flex space-x-2">
              {['To Do', 'In Progress', 'Blocked', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === status 
                      ? getStatusColor(status) 
                      : 'bg-gray-100 text-gray-800 opacity-60'
                  }`}
                  disabled={loading}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
            <p className="text-gray-900">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
            <p className="text-gray-900">
              {task.isPersonal ? 'Personal Task' : `Project: ${task.project?.name || 'Unknown'}`}
            </p>
          </div>
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Subtasks</h3>
            <button
              onClick={() => {
                setEditingSubtask(null);
                setShowSubtaskForm(true);
              }}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              disabled={loading}
            >
              <FaPlus className="mr-1 h-3 w-3" />
              Add Subtask
            </button>
          </div>
          
          {showSubtaskForm && (
            <SubtaskForm
              taskId={task._id}
              initialData={editingSubtask}
              onClose={() => {
                setShowSubtaskForm(false);
                setEditingSubtask(null);
              }}
              onSubtaskAdded={onTaskUpdated}
            />
          )}
          
          {task.subtasks && task.subtasks.length > 0 ? (
            <div className="space-y-2 mt-3">
              {task.subtasks.map(subtask => (
                <div 
                  key={subtask._id} 
                  className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <button
                    onClick={() => handleSubtaskStatusChange(
                      subtask._id, 
                      subtask.status === 'Completed' ? 'To Do' : 'Completed'
                    )}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                      subtask.status === 'Completed' 
                        ? 'bg-green-500 border-green-500 text-white flex items-center justify-center' 
                        : 'border-gray-300'
                    } mr-3 mt-0.5`}
                    disabled={loading}
                  >
                    {subtask.status === 'Completed' && <FaCheck className="h-3 w-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {subtask.title}
                    </p>
                    
                    {subtask.dueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {format(new Date(subtask.dueDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingSubtask(subtask);
                        setShowSubtaskForm(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit Subtask"
                      disabled={loading}
                    >
                      <FaEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete Subtask"
                      disabled={loading}
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No subtasks yet. Add one to break down this task.</p>
          )}
        </div>
        
        {task.progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;