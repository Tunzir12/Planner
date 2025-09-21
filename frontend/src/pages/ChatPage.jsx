import { useState } from 'react';
import UserList from '../components/Chat/UserList';
import Chat from '../components/Chat/Chat';
import { useAuth } from '../components/routeComp/privateRoute'; 
import Navbar from '../components/Navbar';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();

  // Function to handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-cyan-950 text-white">
        {/* Sidebar with user list */}
        <div className="w-1/4 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Users</h2>
          </div>
          <UserList 
            currentUser={currentUser} 
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-cyan-950">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">
                  Chat with {selectedUser.DisplayName || selectedUser.email || selectedUser.displayName}
                </h2>
              </div>
              <Chat otherUserId={selectedUser.id || selectedUser.uid} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-cyan-950">
              <div className="text-center p-6 max-w-md">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No chat selected
                </h3>
                <p className="text-gray-400">
                  Select a user from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatPage;