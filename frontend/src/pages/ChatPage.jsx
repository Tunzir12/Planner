import { useState, useEffect } from 'react';
import UserList from '../components/Chat/UserList';
import Chat from '../components/Chat/Chat';
import { useAuth } from '../components/routeComp/privateRoute';
import Navbar from '../components/Navbar';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState(null);
  const { currentUser } = useAuth();

  // Debug selectedChat changes
  useEffect(() => {
    console.log('=== SELECTED CHAT CHANGED ===', selectedChat);
  }, [selectedChat]);

  // Function to handle user selection - FIXED
  const handleSelectUser = user => {
    console.log('=== SELECTING USER ===', user);
    setSelectedChat(user); // Set selectedChat directly
  };

  const handleNewMessage = messageInfo => {
    setNotification(messageInfo);
    setShowNotification(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Get display name for the header
  const getChatDisplayName = () => {
    if (!selectedChat) return '';

    if (selectedChat.isGroupChat) {
      return selectedChat.name || 'Group Chat';
    } else {
      return (
        selectedChat.DisplayName || selectedChat.displayName || selectedChat.email || 'Unknown User'
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className='flex h-screen bg-cyan-950 text-white'>
        {/* Notification */}
        {showNotification && notification && (
          <div className='fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='font-semibold'>
                  New message in {notification.isGroup ? notification.chatName : 'chat'}
                </p>
                <p className='text-sm opacity-90'>
                  <strong>{notification.sender}:</strong> {notification.message}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className='text-white hover:text-gray-200 ml-2'
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* UserList Sidebar */}
        <div className='w-1/3'>
          <UserList
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            selectedUser={selectedChat}
            onNewMessage={handleNewMessage}
          />
        </div>

        {/* Main chat area - FIXED: Use selectedChat instead of selectedUser */}
        <div className='flex-1 flex flex-col bg-cyan-950'>
          {selectedChat ? (
            <>
              <div className='p-4 border-b border-gray-700 bg-cyan-900'>
                <h2 className='text-xl font-semibold'>
                  {selectedChat.isGroupChat ? (
                    <>
                      <span className='text-purple-400'>Group: </span>
                      {getChatDisplayName()}
                      <span className='ml-2 text-sm text-gray-300'>
                        ({selectedChat.participants?.length || 0} members)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className='text-blue-400'>Chat with </span>
                      {getChatDisplayName()}
                    </>
                  )}
                </h2>
              </div>
              <Chat
                key={selectedChat.id}
                otherUserId={selectedChat.id}
                isGroupChat={selectedChat.isGroupChat || false}
                groupData={selectedChat.isGroupChat ? selectedChat : null}
              />
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center bg-cyan-950'>
              <div className='text-center p-6 max-w-md'>
                <div className='mb-4'>
                  <svg
                    className='w-16 h-16 mx-auto text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-medium text-white mb-2'>No chat selected</h3>
                <p className='text-gray-400'>
                  Select a user or group from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
