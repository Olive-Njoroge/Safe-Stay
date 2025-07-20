import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { getMyConversations, getConversation, createChat, getAvailableChatPartners, debugUsers, socket } from '../services/api';

const Chat = () => {
  const { user, isLandlord } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);

  // Socket setup and chat data fetching
  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    socket.connect();
    socket.emit('joinRoom', { 
      username: user.name, 
      roomId: user.apartmentName 
    });

    socket.on('userJoined', ({ user: joinedUser, roomId }) => {
      console.log('User joined:', joinedUser.name, 'in room:', roomId);
      setOnlineUsers(prev => [...prev.filter(u => u.name !== joinedUser.name), joinedUser]);
    });

    socket.on('newMessage', (message) => {
      console.log('🔔 New message received:', message);
      
      if (message.senderId._id !== user._id) {
        setMessages(prev => {
          const isDuplicate = prev.some(msg => 
            msg._id === message._id || 
            (msg.message === message.message && 
             msg.senderId === message.senderId && 
             Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
          );
          return isDuplicate ? prev : [...prev, message];
        });
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
      
      setConversations(prev => prev.map(conv => {
        const isRelevantConversation = 
          conv.partnerId === message.senderId._id || 
          conv.partnerId === message.receiverId._id;
        
        if (isRelevantConversation) {
          return { ...conv, lastMessage: message };
        }
        return conv;
      }));

      if (message.senderId._id !== user._id && Notification.permission === 'granted') {
        new Notification(`New message from ${message.senderName}`, {
          body: message.message,
          icon: '/favicon.ico'
        });
      }
    });

    return () => {
      socket.off('userJoined');
      socket.off('newMessage');
      socket.disconnect();
    };
  }, [user]);

  // Fetch conversations and users
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Fetching chat data...');
        console.log('🎬 Current user:', user?.name);
        console.log('🏢 User apartment:', user?.apartmentName);
        console.log('👤 User role:', user?.role);

        // Force API call to get available chat partners first
        console.log('🚀 About to call getAvailableChatPartners...');
        
        try {
          const partnersResponse = await getAvailableChatPartners();
          console.log('🎯 Partners API response:', partnersResponse);
          console.log('👥 Available chat partners:', partnersResponse.data);
          const partners = partnersResponse.data || [];
          
          if (isLandlord) {
            const tenantPartners = partners.filter(partner => partner.role === 'Tenant');
            console.log('👤 Landlord can chat with tenants:', tenantPartners);
            setTenants(tenantPartners);
          } else {
            const landlordPartners = partners.filter(partner => partner.role === 'Landlord');
            console.log('🏠 Tenant can chat with landlords:', landlordPartners);
            setLandlords(landlordPartners);
          }
        } catch (partnersError) {
          console.error('❌ Error fetching chat partners:', partnersError);
          console.error('❌ Partners error details:', partnersError.response?.data);
          console.error('❌ Partners error status:', partnersError.response?.status);
          console.error('❌ Partners error message:', partnersError.message);
          setTenants([]);
          setLandlords([]);
        }

        // Debug: Get all users to see apartment assignments
        try {
          const debugResponse = await debugUsers();
          console.log('🐛 All users and apartments:', debugResponse.data);
        } catch (error) {
          console.log('🐛 Debug endpoint error (expected):', error.message);
        }
        
        // Fetch conversations
        const conversationsResponse = await getMyConversations();
        console.log('💬 Conversations response:', conversationsResponse.data);
        const conversationsList = conversationsResponse.data || [];
        setConversations(conversationsList);

        // Auto-select first conversation if available and no conversation is selected
        if (conversationsList.length > 0 && !selectedConversation) {
          console.log('🎯 Auto-selecting first conversation');
          const firstConversation = conversationsList[0];
          setSelectedConversation(firstConversation);
          await loadConversationMessages(firstConversation.partnerId);
        }
      } catch (error) {
        console.error('❌ Error fetching chat data:', error);
        console.error('❌ Error details:', error.response?.data);
        setConversations([]);
        setTenants([]);
        setLandlords([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('✅ useEffect triggered - calling fetchChatData for user:', user.name);
      fetchChatData();
    } else {
      console.log('❌ useEffect triggered but no user found');
    }
  }, [isLandlord, user]);

  // Load messages for a specific conversation
  const loadConversationMessages = async (partnerId) => {
    try {
      setMessagesLoading(true);
      console.log('🔄 Loading messages for partner:', partnerId);
      console.log('🔄 Current user ID:', user._id);
      
      const response = await getConversation(partnerId);
      console.log('💬 Conversation messages response:', response.data);
      setMessages(response.data || []);
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('❌ Error loading conversation messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation && !sending) {
      setSending(true);
      setError('');
      
      const messageText = newMessage.trim();
      
      // Add optimistic message immediately for better UX
      const optimisticMessage = {
        _id: Date.now().toString(),
        message: messageText,
        senderId: user._id,
        receiverId: selectedConversation.partnerId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      try {
        const messageData = {
          receiverId: selectedConversation.partnerId,
          message: messageText
        };

        const response = await createChat(messageData);
        const newMessageObj = response.data.chat;
        
        socket.emit('sendMessage', {
          content: messageText,
          receiverName: selectedConversation.partnerName,
          senderName: user.name,
          senderId: user._id,
          receiverId: selectedConversation.partnerId
        });
        
        setMessages(prev => prev.map(msg => 
          msg._id === optimisticMessage._id ? newMessageObj : msg
        ));
        
        const updatedConversations = conversations.map(conv => 
          conv.partnerId === selectedConversation.partnerId 
            ? { ...conv, lastMessage: newMessageObj }
            : conv
        );
        setConversations(updatedConversations);
        
      } catch (error) {
        console.error('❌ Error sending message:', error);
        setError('Failed to send message. Please try again.');
        
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        setNewMessage(messageText);
      } finally {
        setSending(false);
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const startNewConversation = async (userToMessage) => {
    try {
      const existingConversation = conversations.find(conv => conv.partnerId === userToMessage._id);
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        await loadConversationMessages(existingConversation.partnerId);
      } else {
        const newConversation = {
          partnerId: userToMessage._id,
          partnerName: userToMessage.name,
          partnerRole: userToMessage.role,
          partnerNationalID: userToMessage.nationalID,
          messageCount: 0
        };
        setSelectedConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Debug Info - Remove this after testing */}
      <div className="bg-yellow-100 p-2 text-xs border-b">
        <strong>DEBUG:</strong> User: {user?.name || 'NOT LOGGED IN'} | 
        Role: {user?.role || 'N/A'} | 
        Apartment: {user?.apartmentName || 'N/A'} | 
        Available Partners: {isLandlord ? tenants.length : landlords.length} |
        Tenants: [{tenants.map(t => t.name).join(', ')}] |
        Landlords: [{landlords.map(l => l.name).join(', ')}]
      </div>
      
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isLandlord ? 'Your Tenants' : 'Your Landlord'}
            </p>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm mb-4">No conversations yet</p>
                <button
                  onClick={() => setShowUserList(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isOnline = onlineUsers.some(u => u.name === conversation.partnerName);
                return (
                  <button
                    key={conversation.partnerId}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      loadConversationMessages(conversation.partnerId);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                      selectedConversation?.partnerId === conversation.partnerId ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {conversation.partnerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">{conversation.partnerName}</p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.message || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* User List */}
          {showUserList && (
            <div className="border-t border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {isLandlord ? 'Start chat with tenant:' : 'Available landlords:'}
                </h3>
                <div className="space-y-1">
                  {(isLandlord ? tenants : landlords).map((user) => {
                    const isOnline = onlineUsers.some(u => u.name === user.name);
                    return (
                      <button
                        key={user._id}
                        onClick={() => {
                          startNewConversation(user);
                          setShowUserList(false);
                        }}
                        className="w-full flex items-center p-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="relative mr-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        {isOnline && (
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                    <span className="text-white font-medium">
                      {selectedConversation.partnerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation.partnerName}</h2>
                    <p className="text-sm text-gray-500">{selectedConversation.partnerRole}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.senderId?._id === user._id || message.senderId === user._id;
                    const showTimestamp = index === 0 || 
                      (new Date(message.createdAt || message.timestamp) - new Date(messages[index - 1]?.createdAt || messages[index - 1]?.timestamp)) > 300000;
                    
                    return (
                      <div key={message._id || index}>
                        {showTimestamp && (
                          <div className="text-center mb-4">
                            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                              {new Date(message.createdAt || message.timestamp).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? `bg-green-500 text-white ml-12 ${message.isOptimistic ? 'opacity-70' : ''}`
                              : 'bg-white text-gray-800 mr-12'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs ${
                                isCurrentUser ? 'text-green-100' : 'text-gray-400'
                              }`}>
                                {formatTime(message.createdAt || message.timestamp)}
                              </p>
                              {message.isOptimistic && isCurrentUser && (
                                <div className="text-xs text-green-200 ml-2">
                                  ⏳ Sending...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white p-4 border-t border-gray-200">
                {error && (
                  <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="1"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-gray-400 mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Welcome to Safe Stay Chat
                </h2>
                <p className="text-gray-500 mb-6">
                  Select a conversation to start messaging
                </p>
                <button
                  onClick={() => setShowUserList(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                >
                  Start New Chat
                </button>
                <button
                  onClick={async () => {
                    console.log('🔄 Manual API test...');
                    console.log('🔐 Token:', localStorage.getItem('token'));
                    console.log('👤 User from localStorage:', localStorage.getItem('user'));
                    try {
                      const result = await getAvailableChatPartners();
                      console.log('✅ Manual API result:', result.data);
                      alert(`Found ${result.data.length} available chat partners: ${result.data.map(p => p.name).join(', ')}`);
                    } catch (error) {
                      console.error('❌ Manual API error:', error);
                      console.error('❌ Error response:', error.response?.data);
                      console.error('❌ Error status:', error.response?.status);
                      alert(`API Error: ${error.message} (Status: ${error.response?.status})`);
                    }
                  }}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Test API
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;