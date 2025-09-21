import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc as firestoreDoc,
  getDoc
} from 'firebase/firestore';
import PropTypes from 'prop-types';

const UserList = ({ currentUser, onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'search'

  // Fetch all users (for search)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const usersList = [];
        querySnapshot.forEach((document) => {
          if (document.id !== currentUser.uid) {
            usersList.push({ 
              id: document.id, 
              uid: document.id,
              ...document.data() 
            });
          }
        });
        
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };

    fetchAllUsers();
  }, [currentUser.uid]);

  // Fetch recent chats
  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        // Get all chats and filter locally to avoid index requirements
        const chatsRef = collection(db, 'chats');
        const querySnapshot = await getDocs(chatsRef);
        const recentChatsList = [];
        
        for (const document of querySnapshot.docs) {
          const chatData = document.data();
          
          // Check if current user is a participant
          if (chatData.participants && chatData.participants.includes(currentUser.uid)) {
            // Find the other participant
            const otherParticipantId = chatData.participants.find(
              id => id !== currentUser.uid
            );
            
            if (otherParticipantId) {
              // Get user data
              const userDoc = await getDoc(firestoreDoc(db, 'users', otherParticipantId));
              if (userDoc.exists()) {
                recentChatsList.push({
                  id: otherParticipantId,
                  ...userDoc.data(),
                  lastMessage: chatData.lastMessage,
                  lastMessageTime: chatData.lastMessageTime?.toDate(),
                  chatId: document.id
                });
              }
            }
          }
        }
        
        // Sort by last message time manually
        recentChatsList.sort((a, b) => {
          const timeA = a.lastMessageTime || new Date(0);
          const timeB = b.lastMessageTime || new Date(0);
          return timeB - timeA; // Descending order
        });
        
        setRecentChats(recentChatsList);
      } catch (error) {
        console.error("Error fetching recent chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
  }, [currentUser.uid]);

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.DisplayName?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)) &&
      user.id !== currentUser.uid
    );
  });

  // Combine recent chats and search results
  const displayUsers = activeTab === 'recent' ? recentChats : filteredUsers;

  const handleUserSelect = (user) => {
    onSelectUser(user);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 mb-2">
              <div className="rounded-full bg-gray-700 h-10 w-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) setActiveTab('search');
            }}
            className="w-full p-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === 'recent' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === 'search' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('search')}
        >
          All Users
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {displayUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {activeTab === 'recent' 
              ? 'No recent conversations' 
              : searchTerm 
                ? 'No users found' 
                : 'No other users'
            }
          </div>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user.id}
              className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-cyan-900 transition-colors ${
                selectedUser && selectedUser.id === user.id ? 'bg-cyan-800' : ''
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.DisplayName || user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(user.DisplayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.DisplayName || user.displayName || 'Unknown User'}
                  </p>
                  
                  {activeTab === 'recent' && user.lastMessage && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.lastMessage}
                    </p>
                  )}
                  
                  {activeTab === 'search' && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Last Message Time for Recent Chats */}
                {activeTab === 'recent' && user.lastMessageTime && (
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {user.lastMessageTime.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

UserList.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }).isRequired,
  onSelectUser: PropTypes.func.isRequired,
  selectedUser: PropTypes.object,
};

export default UserList;