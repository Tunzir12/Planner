import { useState } from 'react';
import UserList from '../components/Chat/UserList';
import Chat from '../components/Chat/Chat';
import { useAuth } from '../components/routeComp/privateRoute'; 
import Navbar from '../components/Navbar';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();

  return (
    <>
    <Navbar />
    <div className="flex h-screen bg-cyan-950 text-white">
      {/* Sidebar with user list */}
      <div className="w-1/4 border-r ">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Users</h2>
        </div>
        <UserList 
          currentUser={currentUser} 
          onSelectUser={setSelectedUser} 
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-cyan-950">
        {selectedUser ? (
          <>
            <div className="p-4 border-b ">
              <h2 className="text-xl font-semibold">
                Chat with {selectedUser.DisplayName || selectedUser.email}
              </h2>
            </div>
            <Chat otherUserId={selectedUser.id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-cyan-950 ">
            <div className="text-center p-6 max-w-md">
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