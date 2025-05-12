import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children, projectId }) => {
  const { currentUser } = useAuth();
  
  const [teamMessages, setTeamMessages] = useState([]);
  const [personalMessages, setPersonalMessages] = useState([]);
  const [personalConversations, setPersonalConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLead, setIsLead] = useState(false);
  const [activeChat, setActiveChat] = useState('team'); // 'team' or 'personal'
  const [activeMember, setActiveMember] = useState(null); // For lead's personal chats
  
  // Socket.io connection
  const socketRef = useRef();
  
  // Initialize socket connection
  useEffect(() => {
    if (!projectId || !currentUser) return;
    
    // Connect to socket.io server
    socketRef.current = io('http://localhost:5000');
    
    // Join the project's chat room
    socketRef.current.emit('joinProject', projectId);
    
    // Listen for new team messages
    socketRef.current.on('newTeamMessage', (message) => {
      setTeamMessages(prev => {
        // Check if message already exists in the array (prevent duplicates)
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    });
    
    // Listen for new personal messages
    socketRef.current.on('newPersonalMessage', (message) => {
      // Only add personal messages that involve the current user
      if (
        (message.sender._id === currentUser.id || message.recipient._id === currentUser.id) &&
        !message.isTeamChat
      ) {
        setPersonalMessages(prev => {
          // Check if message already exists in the array (prevent duplicates)
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId, currentUser]);
  
  // Reset messages when project changes
  useEffect(() => {
    if (projectId) {
      setTeamMessages([]);
      setPersonalMessages([]);
      setPersonalConversations([]);
      setActiveChat('team');
      setActiveMember(null);
    }
  }, [projectId]);
  
  const fetchMessages = async (type) => {
    if (!projectId || !currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      let endpoint;
      if (type === 'team') {
        endpoint = `http://localhost:5000/api/v1/projects/${projectId}/chat/team`;
      } else {
        endpoint = `http://localhost:5000/api/v1/projects/${projectId}/chat/personal`;
      }
      
      const res = await axios.get(endpoint, config);
      
      if (type === 'team') {
        setTeamMessages(res.data.data.messages);
      } else {
        setPersonalMessages(res.data.data.messages);
        setIsLead(res.data.data.isLead);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPersonalConversations = async () => {
    if (!projectId || !currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const endpoint = `http://localhost:5000/api/v1/projects/${projectId}/chat/personal/conversations`;
      
      const res = await axios.get(endpoint, config);
      setPersonalConversations(res.data.data.conversations);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching personal conversations');
      console.error('Error fetching personal conversations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async (content, type, memberId = null) => {
    if (!projectId || !currentUser || !content.trim()) return;
    
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      let endpoint;
      if (type === 'team') {
        endpoint = `http://localhost:5000/api/v1/projects/${projectId}/chat/team`;
      } else {
        endpoint = `http://localhost:5000/api/v1/projects/${projectId}/chat/personal`;
      }
      
      const res = await axios.post(endpoint, { content }, config);
      const newMessage = res.data.data.message;
      
      // Emit the message through socket.io
      if (socketRef.current) {
        if (type === 'team') {
          socketRef.current.emit('teamChatMessage', newMessage);
        } else {
          socketRef.current.emit('personalChatMessage', newMessage);
        }
      }
      
      return newMessage;
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending message');
      console.error('Error sending message:', err);
      return null;
    }
  };
  
  const value = {
    teamMessages,
    personalMessages,
    personalConversations,
    loading,
    error,
    isLead,
    activeChat,
    setActiveChat,
    activeMember,
    setActiveMember,
    fetchMessages,
    fetchPersonalConversations,
    sendMessage
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext; 