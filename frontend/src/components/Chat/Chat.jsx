import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../routeComp/privateRoute';

export default function Chat({ otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserData, setOtherUserData] = useState(null);
  const [webSocket, setWebSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Generate consistent chat ID between two users
  const chatId = [currentUser?.uid, otherUserId].sort().join('_');

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Register user with the WebSocket server
      ws.send(JSON.stringify({
        type: 'register',
        userId: currentUser.uid
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'registered') {
        console.log('User registered with WebSocket server');
        setWebSocket(ws);
      }
      else if (data.type === 'new_message') {
        // Add new message to UI
        setMessages(prev => [...prev, data.message]);
      }
      else if (data.type === 'message_sent') {
        // Message was successfully sent
        setNewMessage('');
      }
      else if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      setWebSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUser]);

  // Fetch the other user's data
  useEffect(() => {
    if (!otherUserId) return;

    const fetchOtherUser = async () => {
      const userRef = doc(db, 'users', otherUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setOtherUserData(userSnap.data());
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  // Create chat room if it doesn't exist
  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    const ensureChatRoomExists = async () => {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, otherUserId],
          lastMessage: '',
          lastMessageTime: new Date(),
          participantInfo: {
            [currentUser.uid]: {
              displayName: currentUser.displayName || currentUser.email,
            },
            [otherUserId]: {
              displayName: otherUserData?.displayName || '',
            }
          }
        });
      }
    };

    ensureChatRoomExists();
  }, [currentUser, otherUserId, chatId, otherUserData]);

  // Load message history when component mounts
  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const messagesRef = db.collection('messages')
          .where('chatId', '==', chatId)
          .orderBy('createdAt');
        
        const snapshot = await messagesRef.get();
        const messagesData = [];
        
        snapshot.forEach(doc => {
          messagesData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          });
        });
        
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching message history:', error);
      }
    };
    
    if (chatId) {
      fetchMessageHistory();
    }
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUserId || !webSocket) return;

    try {
      // Send message via WebSocket
      webSocket.send(JSON.stringify({
        type: 'send_message',
        text: newMessage,
        senderId: currentUser.uid,
        receiverId: otherUserId,
        chatId
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col">
      
      {/* Connection status */}
      <div className="p-2 bg-gray-100 text-center text-sm">
        Status: {isConnected ? 'Connected' : 'Connecting...'}
        {!isConnected && (
          <span className="ml-2 text-orange-500">
            (Make sure WebSocket server is running on port 8080)
          </span>
        )}
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.senderId === currentUser?.uid 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
            >
              <p>{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.createdAt ? message.createdAt.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t ">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-800 text-black"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-sky-900 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            disabled={!newMessage.trim() || !isConnected}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}