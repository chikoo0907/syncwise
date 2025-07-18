import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight,
  Send,
  X,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  Clock
} from 'lucide-react';

export default function Chat() {
  const [clients, setClients] = useState([
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      email: 'sarah.j@university.edu',
      lastMessage: 'Hi! I have a question about my order',
      unread: 3,
      lastMessageTime: '2 hours ago',
      avatar: 'SJ',
      status: 'active',
      company: 'Tech University'
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      email: 'mike.chen@student.edu',
      lastMessage: 'The project is going well, thanks!',
      unread: 0,
      lastMessageTime: '4 hours ago',
      avatar: 'MC',
      status: 'active',
      company: 'Student Inc'
    },
    { 
      id: 3, 
      name: 'Emma Wilson', 
      email: 'emma.w@college.edu',
      lastMessage: 'Can we schedule a meeting next week?',
      unread: 1,
      lastMessageTime: '1 day ago',
      avatar: 'EW',
      status: 'away',
      company: 'College Partners'
    },
    { 
      id: 4, 
      name: 'David Rodriguez', 
      email: 'david.r@uni.edu',
      lastMessage: 'Please review the attached documents',
      unread: 0,
      lastMessageTime: '3 days ago',
      avatar: 'DR',
      status: 'offline',
      company: 'University Systems'
    },
    { 
      id: 5, 
      name: 'Lisa Thompson', 
      email: 'lisa.t@business.com',
      lastMessage: 'The contract looks good to me',
      unread: 0,
      lastMessageTime: '1 week ago',
      avatar: 'LT',
      status: 'offline',
      company: 'Business Solutions'
    }
  ]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize messages for each client
  useEffect(() => {
    const initialMessages = {};
    clients.forEach(client => {
      initialMessages[client.id] = [
        {
          id: 1,
          text: client.lastMessage,
          sender: 'client',
          time: client.lastMessageTime,
          read: client.unread === 0
        },
        {
          id: 2,
          text: 'Thank you for reaching out to us!',
          sender: 'you',
          time: '1 day ago',
          read: true
        }
      ];
    });
    setMessages(initialMessages);
  }, [clients]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'unread' && client.unread > 0) ||
                         (filterStatus === 'active' && client.status === 'active') ||
                         (filterStatus === 'away' && client.status === 'away') ||
                         (filterStatus === 'offline' && client.status === 'offline');
    
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (messageText.trim() && selectedClient) {
      const newMessage = {
        id: messages[selectedClient.id].length + 1,
        text: messageText,
        sender: 'you',
        time: 'Just now',
        read: true
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedClient.id]: [...prev[selectedClient.id], newMessage]
      }));
      
      // Mark as read
      setClients(clients.map(client => 
        client.id === selectedClient.id ? { ...client, unread: 0 } : client
      ));
      
      setMessageText('');
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // Mark as read when selected
    setClients(clients.map(c => 
      c.id === client.id ? { ...c, unread: 0 } : c
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
          {/* Client List Sidebar */}
          <div className={`${isMobileView && selectedClient ? 'hidden' : 'block'} w-full md:w-1/3 border-r border-gray-200 flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
            </div>
            
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('unread')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'unread' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('away')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'away' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  Away
                </button>
                <button
                  onClick={() => setFilterStatus('offline')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'offline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  Offline
                </button>
              </div>
            </div>
            
            {/* Client List */}
            <div className="flex-1 overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedClient?.id === client.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="relative mr-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {client.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(client.status)}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{client.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{client.lastMessage}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">{client.company}</span>
                      </div>
                    </div>
                    
                    {client.unread > 0 && (
                      <div className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {client.unread}
                      </div>
                    )}
                    
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No clients found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className={`${isMobileView && !selectedClient ? 'hidden' : 'flex'} flex-col flex-1`}>
            {selectedClient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    {isMobileView && (
                      <button 
                        onClick={() => setSelectedClient(null)}
                        className="mr-2 p-1 rounded-full hover:bg-gray-100"
                      >
                        <ChevronRight className="w-5 h-5 transform rotate-180" />
                      </button>
                    )}
                    <div className="relative mr-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {selectedClient.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(selectedClient.status)}`}></div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedClient.name}</h2>
                      <p className="text-sm text-gray-500">{selectedClient.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-3">
                    {messages[selectedClient.id]?.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${message.sender === 'you' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                        >
                          <p>{message.text}</p>
                          <div className={`flex items-center justify-end mt-1 text-xs ${message.sender === 'you' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.time}
                            {message.sender === 'you' && message.read && (
                              <Check className="w-3 h-3 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 mx-2 px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-2 rounded-full ${messageText.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a client to chat</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a client from the list to view your conversation history or start a new conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}