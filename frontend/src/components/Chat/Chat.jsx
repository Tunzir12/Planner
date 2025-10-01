import { useState, useEffect, useRef } from 'react';
import { 
  doc, getDoc, setDoc, collection, query, 
  where, orderBy, onSnapshot, addDoc, serverTimestamp,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../routeComp/privateRoute';

export default function Chat({ otherUserId, isGroupChat = false, groupData = null }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserData, setOtherUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Generate chat ID based on chat type
  const chatId = isGroupChat ? otherUserId : [currentUser?.uid, otherUserId].sort().join('_');

  // Fetch the other user's data (for individual chats) or group data
  useEffect(() => {
    if (!otherUserId) return;

    const fetchChatData = async () => {
      try {
        setChatLoading(true);
        
        if (isGroupChat && groupData) {
          // Use provided group data
          setOtherUserData({
            ...groupData,
            isGroupChat: true
          });
        } else if (isGroupChat) {
          // Fetch group data if not provided
          const groupRef = doc(db, 'chats', otherUserId);
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            setOtherUserData({
              ...groupSnap.data(),
              isGroupChat: true
            });
          }
        } else {
          // Fetch individual user data
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setOtherUserData({
              uid: userSnap.id,
              displayName: userData.displayName || userData.email || 'Unknown User',
              email: userData.email || 'No email',
              isGroupChat: false,
              ...userData
            });
          } else {
            setOtherUserData({
              uid: otherUserId,
              displayName: 'Unknown User',
              email: 'No email',
              isGroupChat: false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        // Create fallback data
        setOtherUserData({
          uid: otherUserId,
          displayName: isGroupChat ? 'Unknown Group' : 'Unknown User',
          email: 'No email',
          isGroupChat: isGroupChat
        });
      } finally {
        setChatLoading(false);
      }
    };

    fetchChatData();
  }, [otherUserId, isGroupChat, groupData]);

  // Create or get chat room
  useEffect(() => {
    if (!currentUser || !otherUserId || !otherUserData || chatLoading) return;

    const ensureChatRoomExists = async () => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists() && !isGroupChat) {
          // Only create individual chat rooms, groups are created separately
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

          await setDoc(chatRef, {
            participants: [currentUser.uid, otherUserId],
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            participantInfo: participantInfo,
            isGroupChat: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('Individual chat room created successfully');
        }
      } catch (error) {
        console.error('Error ensuring chat room exists:', error);
      }
    };

    ensureChatRoomExists();
  }, [currentUser, otherUserId, chatId, otherUserData, chatLoading, isGroupChat]);

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
        chatId: chatId,
        createdAt: serverTimestamp(),
        readBy: [currentUser.uid], // Track who has read the message
        senderName: senderName,
        isGroupMessage: isGroupChat // Mark as group message if it's a group chat
      };

      // Add receiver info for individual chats
      if (!isGroupChat) {
        messageData.receiverId = otherUserId;
      }

      console.log('Sending message:', messageData);

      // Add message to Firestore
      const messagesRef = collection(db, 'messages');
      const messageRef = await addDoc(messagesRef, messageData);

      // Update chat room with last message info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        updatedAt: serverTimestamp()
      });

      // Clear input field
      setNewMessage('');
      
      console.log('Message sent successfully:', messageRef.id);

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
          msg => !msg.readBy?.includes(currentUser.uid)
        );

        for (const message of unreadMessages) {
          const messageRef = doc(db, 'messages', message.id);
          await updateDoc(messageRef, {
            readBy: arrayUnion(currentUser.uid)
          });
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
    
    if (isGroupChat && otherUserData?.participantInfo?.[message.senderId]) {
      return otherUserData.participantInfo[message.senderId].displayName;
    }
    
    return message.senderName || 'Unknown User';
  };

  if (!otherUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a user or group to start chatting
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
            {isGroupChat ? 'No messages in this group yet. Start the conversation!' : 'No messages yet. Start the conversation!'}
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-xs lg:max-w-md">
                {(isGroupChat && message.senderId !== currentUser?.uid) && (
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
                      message.readBy?.length > 1 ? ' ✓✓' : ' ✓'
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
        <div className="flex space-x-2 text-black">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isGroupChat ? "Type a message to the group..." : "Type a message..."}
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