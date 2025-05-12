import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { FaArrowRight, FaUsers, FaUserCircle, FaComments } from 'react-icons/fa';

const Chat = () => {
  const {
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
  } = useChat();
  
  const { currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  
  // Fetch messages when component mounts
  useEffect(() => {
    if (activeChat === 'team') {
      fetchMessages('team');
    } else {
      fetchMessages('personal');
      if (isLead) {
        fetchPersonalConversations();
      }
    }
  }, [activeChat, activeMember]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [teamMessages, personalMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    await sendMessage(messageText, activeChat);
    setMessageText('');
  };
  
  const handleChatTypeChange = (type) => {
    setActiveChat(type);
    if (type === 'personal' && isLead) {
      fetchPersonalConversations();
    }
  };
  
  const handleMemberSelect = (memberId) => {
    setActiveMember(memberId);
  };
  
  // Display personal chats for lead or regular users
  const renderPersonalChat = () => {
    // For lead: show list of conversations + selected conversation
    if (isLead && personalConversations.length > 0) {
      return (
        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
            {personalConversations.map((convo) => (
              <div
                key={convo.member._id}
                className={`p-3 hover:bg-gray-100 cursor-pointer ${
                  activeMember === convo.member._id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleMemberSelect(convo.member._id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{convo.member.name}</div>
                    <div className="text-xs text-gray-500 truncate w-32">
                      {convo.lastMessage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Selected conversation */}
          <div className="w-3/4 flex flex-col">
            {activeMember ? (
              renderChatMessages()
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // For regular members: just show the chat with lead
    return renderChatMessages();
  };
  
  const renderChatMessages = () => {
    const messages = activeChat === 'team' ? teamMessages : personalMessages;
    
    return (
      <>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`mb-4 flex ${
                  message.sender._id === currentUser.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg ${
                    message.sender._id === currentUser.id
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {message.sender.name}
                    {message.sender._id === currentUser.id && ' (You)'}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs opacity-75 text-right mt-1">
                    {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex">
            <input
              type="text"
              className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 focus:outline-none"
            >
              <FaArrowRight />
            </button>
          </div>
        </form>
      </>
    );
  };
  
  if (loading && !teamMessages.length && !personalMessages.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              activeChat === 'team'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleChatTypeChange('team')}
          >
            <FaUsers />
            <span>Team Chat</span>
          </button>
          <button
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              activeChat === 'personal'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleChatTypeChange('personal')}
          >
            <FaComments />
            <span>
              {isLead ? 'Personal Chats' : 'Chat with Lead'}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeChat === 'team' ? renderChatMessages() : renderPersonalChat()}
      </div>
    </div>
  );
};

export default Chat; 