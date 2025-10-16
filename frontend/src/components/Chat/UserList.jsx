import { useState, useEffect } from 'react';
import { db } from '../../../../backend/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc as firestoreDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import PropTypes from 'prop-types';

const UserList = ({ currentUser, onSelectUser, selectedUser, onNewMessage }) => {
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState(null);

  // Safe function to get user display name
  const getSafeDisplayName = user => {
    if (!user) return 'Unknown User';
    return user.DisplayName || user.displayName || user.email || 'Unknown User';
  };

  // Safe function to get user email
  const getSafeEmail = user => {
    if (!user) return 'No email';
    return user.email || 'No email';
  };

  // Fetch all users (for search)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setError(null);
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const usersList = [];
        querySnapshot.forEach(document => {
          if (document.id !== currentUser.uid) {
            const userData = document.data();
            usersList.push({
              id: document.id,
              uid: document.id,
              DisplayName: getSafeDisplayName(userData),
              displayName: getSafeDisplayName(userData),
              email: getSafeEmail(userData),
              ...userData,
            });
          }
        });

        setAllUsers(usersList);
      } catch (error) {
        console.error('Error fetching all users:', error);
        setError('Failed to load users');
      }
    };

    fetchAllUsers();
  }, [currentUser.uid]);

  // Real-time listener for chats
  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubscribe = null;

    try {
      setError(null);
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef);

      unsubscribe = onSnapshot(
        q,
        async snapshot => {
          try {
            const recentChatsList = [];
            const newUnreadCounts = {};

            for (const document of snapshot.docs) {
              try {
                const chatData = document.data();

                if (!chatData.participants || !Array.isArray(chatData.participants)) {
                  continue;
                }

                if (chatData.participants.includes(currentUser.uid)) {
                  const isGroupChat = chatData.isGroupChat || chatData.participants.length > 2;

                  if (isGroupChat) {
                    // Group chat
                    recentChatsList.push({
                      id: document.id,
                      name: chatData.name || 'Unnamed Group',
                      participants: chatData.participants || [],
                      participantInfo: chatData.participantInfo || {},
                      isGroupChat: true,
                      lastMessage: chatData.lastMessage || '',
                      lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                      chatId: document.id,
                    });
                  } else {
                    // Individual chat
                    const otherParticipantId = chatData.participants.find(
                      id => id !== currentUser.uid,
                    );

                    if (otherParticipantId) {
                      try {
                        const userDoc = await getDoc(firestoreDoc(db, 'users', otherParticipantId));
                        if (userDoc.exists()) {
                          const userData = userDoc.data();
                          recentChatsList.push({
                            id: otherParticipantId,
                            DisplayName: getSafeDisplayName(userData),
                            displayName: getSafeDisplayName(userData),
                            email: getSafeEmail(userData),
                            lastMessage: chatData.lastMessage || '',
                            lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                            chatId: document.id,
                            isGroupChat: false,
                            ...userData,
                          });
                        }
                      } catch (userError) {
                        console.error('Error fetching user data:', userError);
                        recentChatsList.push({
                          id: otherParticipantId,
                          DisplayName: 'Unknown User',
                          displayName: 'Unknown User',
                          email: 'No email',
                          lastMessage: chatData.lastMessage || '',
                          lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                          chatId: document.id,
                          isGroupChat: false,
                        });
                      }
                    }
                  }

                  newUnreadCounts[document.id] = 0;
                }
              } catch (docError) {
                console.error('Error processing chat document:', docError);
              }
            }

            recentChatsList.sort((a, b) => {
              const timeA = a.lastMessageTime || new Date(0);
              const timeB = b.lastMessageTime || new Date(0);
              return timeB.getTime() - timeA.getTime();
            });

            setRecentChats(recentChatsList);
            setUnreadCounts(newUnreadCounts);
            setLoading(false);
          } catch (processingError) {
            console.error('Error processing snapshot:', processingError);
            setError('Error loading chats');
            setLoading(false);
          }
        },
        error => {
          console.error('Error in chat listener:', error);
          setError('Failed to load chats in real-time');
          setLoading(false);
        },
      );
    } catch (setupError) {
      console.error('Error setting up chat listener:', setupError);
      setError('Failed to set up chat listener');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid]);

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    if (!searchTerm.trim()) return false;

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

  // Fixed handleUserSelect function
  const handleUserSelect = user => {
    console.log('User selected:', user); // Debug log

    try {
      // Reset unread count when user selects a chat
      const chatId = user.chatId || user.id;
      if (chatId) {
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: 0,
        }));
      }

      // Prepare the user object for the chat component
      const selectedUserData = {
        id: user.id,
        isGroupChat: user.isGroupChat || false,
        // Include all necessary data for the chat component
        ...user,
      };

      console.log('Calling onSelectUser with:', selectedUserData); // Debug log
      onSelectUser(selectedUserData);
    } catch (error) {
      console.error('Error selecting user:', error);
      setError('Error selecting chat');
    }
  };

  // Group chat functions
  const toggleUserSelection = user => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const createGroupChat = async () => {
    if (selectedUsers.length < 2 || !groupName.trim()) {
      alert('Please select at least 2 users and provide a group name');
      return;
    }

    setCreatingGroup(true);
    setError(null);

    try {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const allParticipants = [currentUser.uid, ...selectedUsers.map(u => u.id)];

      const participantInfo = {};

      participantInfo[currentUser.uid] = {
        displayName: getSafeDisplayName(currentUser),
        email: getSafeEmail(currentUser),
      };

      selectedUsers.forEach(user => {
        participantInfo[user.id] = {
          displayName: getSafeDisplayName(user),
          email: getSafeEmail(user),
        };
      });

      const groupChatRef = firestoreDoc(db, 'chats', groupId);
      await setDoc(groupChatRef, {
        id: groupId,
        name: groupName.trim(),
        participants: allParticipants,
        participantInfo: participantInfo,
        isGroupChat: true,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSelectedUsers([]);
      setGroupName('');
      setShowGroupModal(false);

      // Call onSelectUser with the new group data
      const newGroupData = {
        id: groupId,
        name: groupName.trim(),
        isGroupChat: true,
        participants: allParticipants,
        participantInfo: participantInfo,
      };

      console.log('Creating group and selecting:', newGroupData); // Debug log
      onSelectUser(newGroupData);
    } catch (error) {
      console.error('Error creating group chat:', error);
      setError('Failed to create group chat. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const openGroupModal = () => {
    setShowGroupModal(true);
    setSelectedUsers([]);
    setGroupName('');
    setError(null);
  };

  // Get unread count for a chat
  const getUnreadCount = chat => {
    return unreadCounts[chat.chatId || chat.id] || 0;
  };

  // Show error state
  if (error && recentChats.length === 0 && allUsers.length === 0) {
    return (
      <div className='h-full flex flex-col items-center justify-center p-4'>
        <div className='text-red-500 text-center'>
          <svg
            className='w-12 h-12 mx-auto mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
          <p className='font-semibold mb-2'>Unable to load chats</p>
          <p className='text-sm mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (loading && recentChats.length === 0) {
    return (
      <div className='p-4'>
        <div className='animate-pulse'>
          {[1, 2, 3].map(i => (
            <div key={i} className='flex items-center space-x-3 p-3 mb-2'>
              <div className='rounded-full bg-gray-300 h-10 w-10'></div>
              <div className='flex-1'>
                <div className='h-4 bg-gray-300 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-300 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Error Banner */}
      {error && (
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 text-sm'>
          {error}
          <button onClick={() => setError(null)} className='float-right font-bold'>
            ×
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className='p-3 border-b border-gray-200'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (e.target.value) setActiveTab('search');
            }}
            className='w-full p-2 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <svg
            className='absolute left-3 top-2.5 w-5 h-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {/* Create Group Button */}
      <div className='p-3 border-b border-gray-200'>
        <button
          onClick={openGroupModal}
          className='w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          <span>Create Group Chat</span>
        </button>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200'>
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === 'recent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('search')}
        >
          All Users
        </button>
      </div>

      {/* Users List */}
      <div className='flex-1 overflow-y-auto'>
        {displayUsers.length === 0 ? (
          <div className='p-4 text-center text-white'>
            {activeTab === 'recent'
              ? 'No recent conversations'
              : searchTerm
                ? 'No users found'
                : 'No other users'}
          </div>
        ) : (
          displayUsers.map(user => {
            const unreadCount = getUnreadCount(user);
            const displayName = getSafeDisplayName(user);

            return (
              <div
                key={user.id}
                className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedUser && selectedUser.id === user.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => {
                  console.log('Clicked user:', user); // Debug log
                  handleUserSelect(user);
                }}
              >
                <div className='flex items-center space-x-3'>
                  {/* User/Group Avatar */}
                  <div className='flex-shrink-0 relative'>
                    {user.isGroupChat ? (
                      <div className='w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center'>
                        <svg
                          className='w-5 h-5 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                          />
                        </svg>
                      </div>
                    ) : user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={displayName}
                        className='w-10 h-10 rounded-full text-white'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center'>
                        <span className='text-white font-medium'>
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Unread message indicator */}
                    {unreadCount > 0 && (
                      <div className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>

                  {/* User/Group Info */}
                  <div className='flex-1 min-w-0  text-white hover:text-black '>
                    <p className='text-sm font-medium truncate'>
                      {user.isGroupChat ? user.name : displayName}
                      {user.isGroupChat && (
                        <span className='ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                          Group
                        </span>
                      )}
                    </p>

                    {activeTab === 'recent' && user.lastMessage && (
                      <p className='text-xs truncate'>{user.lastMessage}</p>
                    )}

                    {activeTab === 'search' && !user.isGroupChat && (
                      <p className='text-xs text-gray-600 truncate'>{getSafeEmail(user)}</p>
                    )}

                    {user.isGroupChat && (
                      <p className='text-xs text-gray-600 truncate'>
                        {user.participants?.length || 0} members
                      </p>
                    )}
                  </div>

                  {/* Last Message Time for Recent Chats */}
                  {activeTab === 'recent' && user.lastMessageTime && (
                    <div className='flex-shrink-0'>
                      <p className='text-xs text-gray-500'>
                        {user.lastMessageTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-md'>
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-medium text-gray-800'>Create Group Chat</h3>
            </div>

            <div className='p-4'>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Group Name</label>
                <input
                  type='text'
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder='Enter group name...'
                  className='w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Selected Users ({selectedUsers.length})
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className='bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1'
                      >
                        <span>{getSafeDisplayName(user)}</span>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className='hover:text-red-200'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='max-h-60 overflow-y-auto'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Select Users (min 2)
                </label>
                {allUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                      selectedUsers.some(u => u.id === user.id)
                        ? 'bg-green-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {getSafeDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm'>{getSafeDisplayName(user)}</p>
                      <p className='text-xs opacity-70'>{getSafeEmail(user)}</p>
                    </div>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <div className='text-white'>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className='p-4 border-t border-gray-200 flex justify-end space-x-2'>
              <button
                onClick={() => setShowGroupModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                disabled={creatingGroup}
              >
                Cancel
              </button>
              <button
                onClick={createGroupChat}
                disabled={selectedUsers.length < 2 || !groupName.trim() || creatingGroup}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {creatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserList.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onSelectUser: PropTypes.func.isRequired,
  selectedUser: PropTypes.object,
  onNewMessage: PropTypes.func,
};

export default UserList;
