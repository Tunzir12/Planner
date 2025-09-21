const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// HTTP function for chat operations (connect, send, poll)
exports.chat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const { action, chatId, userId, text, senderId, receiverId, lastMessageTime } = req.body;

    if (action === "connect") {
      // Simple connection acknowledgment
      res.json({ status: "connected", chatId, userId });
      
    } else if (action === "send") {
      // Validate required fields
      if (!text || !senderId || !receiverId || !chatId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Save message to Firestore
      const messageData = {
        text,
        senderId,
        receiverId,
        chatId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      
      const docRef = await admin.firestore().collection("messages").add(messageData);
      
      // Update chat room
      await admin.firestore().collection("chats").doc(chatId).update({
        lastMessage: text,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ 
        success: true, 
        messageId: docRef.id,
        ...messageData
      });
      
    } else if (action === "poll") {
      // Validate required fields
      if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
      }
      
      // Get messages for this chat
      let messagesRef = admin.firestore()
        .collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("createdAt");
      
      // If lastMessageTime is provided, get only newer messages
      if (lastMessageTime) {
        messagesRef = messagesRef.where("createdAt", ">", new Date(lastMessageTime));
      }
      
      const snapshot = await messagesRef.get();
      const messages = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      
      res.json(messages);
      
    } else {
      res.status(400).json({ error: "Invalid action. Use 'connect', 'send', or 'poll'" });
    }
  } catch (error) {
    console.error("Error in chat function:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// REST API endpoint to get message history
exports.getMessages = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }
  
  try {
    const { chatId } = req.query;
    
    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" });
    }
    
    const messagesRef = admin.firestore()
      .collection("messages")
      .where("chatId", "==", chatId)
      .orderBy("createdAt");
    
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});