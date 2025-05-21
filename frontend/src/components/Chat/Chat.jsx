import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../routeComp/privateRoute';

export default function Chat({ otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserData, setOtherUserData] = useState(null);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Generate consistent chat ID between two users
  const chatId = [currentUser?.uid, otherUserId].sort().join('_');

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
          lastMessageTime: serverTimestamp(),
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

  // Real-time messages subscription
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        messagesData.push({
          id: doc.id,
          ...message,
          createdAt: message.createdAt?.toDate() // Convert Firestore timestamp
        });
      });
      setMessages(messagesData);
    });

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
      // Add the new message
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        receiverId: otherUserId,
        chatId,
        createdAt: serverTimestamp(),
        read: false
      });

      // Update chat room's last message
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      }, { merge: true });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      
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
                {message.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}