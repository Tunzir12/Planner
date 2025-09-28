import { useState, useEffect, useRef } from 'react';
import { 
  doc, getDoc, setDoc, collection, query, 
  where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../routeComp/privateRoute';

export default function Chat({ otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserData, setOtherUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Generate consistent chat ID between two users
  const chatId = [currentUser?.uid, otherUserId].sort().join('_');

  // Fetch the other user's data
  useEffect(() => {
    if (!otherUserId) return;

    const fetchOtherUser = async () => {
      try {
        setChatLoading(true);
        const userRef = doc(db, 'users', otherUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setOtherUserData({
            uid: userSnap.id,
            displayName: userData.displayName || userData.email || 'Unknown User',
            email: userData.email || 'No email',
            ...userData
          });
        } else {
          // If user doesn't exist, create a fallback
          setOtherUserData({
            uid: otherUserId,
            displayName: 'Unknown User',
            email: 'No email'
          });
        }
      } catch (error) {
        console.error('Error fetching other user data:', error);
        // Create fallback user data
        setOtherUserData({
          uid: otherUserId,
          displayName: 'Unknown User',
          email: 'No email'
        });
      } finally {
        setChatLoading(false);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  // Create or get chat room
  useEffect(() => {
    if (!currentUser || !otherUserId || !otherUserData || chatLoading) return;

    const ensureChatRoomExists = async () => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        // Ensure we have valid user data
        const currentUserDisplayName = currentUser.displayName || currentUser.email || 'You';
        const otherUserDisplayName = otherUserData.displayName || otherUserData.email || 'Unknown User';
        const currentUserEmail = currentUser.email || 'No email';
        const otherUserEmail = otherUserData.email || 'No email';

        const participantInfo = {
          [currentUser.uid]: {
            displayName: currentUserDisplayName,
            email: currentUserEmail
          },
          [otherUserId]: {
            displayName: otherUserDisplayName,
            email: otherUserEmail
          }
        };

        if (!chatSnap.exists()) {
          // Create new chat room
          await setDoc(chatRef, {
            participants: [currentUser.uid, otherUserId],
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            participantInfo: participantInfo,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('Chat room created successfully');
        } else {
          // Update participant info if needed (merge to preserve existing data)
          await setDoc(chatRef, {
            participantInfo: participantInfo,
            updatedAt: serverTimestamp()
          }, { merge: true });
          console.log('Chat room updated successfully');
        }
      } catch (error) {
        console.error('Error ensuring chat room exists:', error);
      }
    };

    ensureChatRoomExists();
  }, [currentUser, otherUserId, chatId, otherUserData, chatLoading]);

  // Real-time message listener
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef, 
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const messagesData = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        
        setMessages(messagesData);
        setIsConnected(true);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        setIsConnected(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUserId) return;

    try {
      // Ensure we have valid display names
      const senderName = currentUser.displayName || currentUser.email || 'You';
      
      // Create message object
      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: otherUserId,
        chatId: chatId,
        createdAt: serverTimestamp(),
        read: false,
        senderName: senderName
      };

      // Add message to Firestore
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, messageData);

      // Update chat room with last message info
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Clear input field
      setNewMessage('');

    } catch (error) {
      console.error("Error sending message:", error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!currentUser || !messages.length) return;

    const markMessagesAsRead = async () => {
      try {
        const unreadMessages = messages.filter(
          msg => msg.receiverId === currentUser.uid && !msg.read
        );

        for (const message of unreadMessages) {
          const messageRef = doc(db, 'messages', message.id);
          await setDoc(messageRef, { read: true }, { merge: true });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [messages, currentUser]);

  // Helper function to format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  // Get display name for message sender
  const getSenderName = (message) => {
    if (message.senderId === currentUser?.uid) {
      return 'You';
    }
    return otherUserData?.displayName || otherUserData?.email || 'Unknown User';
  };

  if (!otherUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a user to start chatting
      </div>
    );
  }

  if (chatLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Chat header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {otherUserData?.displayName?.charAt(0) || otherUserData?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {otherUserData?.displayName || otherUserData?.email || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Connection status */}
      {!isConnected && (
        <div className="p-2 bg-yellow-100 text-center text-sm text-yellow-800">
          Connecting to chat...
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-xs lg:max-w-md">
                {message.senderId !== currentUser?.uid && (
                  <p className="text-xs text-gray-500 mb-1 ml-2">
                    {getSenderName(message)}
                  </p>
                )}
                <div 
                  className={`p-3 rounded-lg ${message.senderId === currentUser?.uid 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                >
                  <p className="break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatMessageTime(message.createdAt)}
                    {message.senderId === currentUser?.uid && (
                      message.read ? ' ✓✓' : ' ✓'
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim() || !isConnected}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}