// websocket-server.js
import { WebSocketServer } from 'ws';
import admin from 'firebase-admin';

// Initialize Firebase Admin
try {
  // For now, we'll skip Firebase admin initialization to focus on WebSocket
  console.log('Firebase Admin initialization skipped for now');
} catch (error) {
  console.log('Firebase Admin not initialized:', error.message);
}

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Store connected clients
const clients = new Map();

console.log('WebSocket server starting on port 8080...');

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type);
      
      if (data.type === 'register') {
        // Register client with their user ID
        clients.set(data.userId, ws);
        ws.userId = data.userId;
        console.log(`User ${data.userId} registered`);
        
        ws.send(JSON.stringify({ 
          type: 'registered', 
          userId: data.userId,
          status: 'success'
        }));
      }
      else if (data.type === 'send_message') {
        // For now, just echo the message back
        // In a real implementation, you'd save to Firebase here
        
        // Notify sender
        ws.send(JSON.stringify({
          type: 'message_sent',
          messageId: 'temp-' + Date.now(),
          text: data.text,
          senderId: data.senderId,
          receiverId: data.receiverId,
          chatId: data.chatId,
          createdAt: new Date().toISOString(),
          status: 'success'
        }));
        
        // Notify receiver if they're connected
        const receiverWs = clients.get(data.receiverId);
        if (receiverWs && receiverWs.readyState === 1) { // 1 = OPEN
          receiverWs.send(JSON.stringify({
            type: 'new_message',
            message: { 
              id: 'temp-' + Date.now(),
              text: data.text,
              senderId: data.senderId,
              receiverId: data.receiverId,
              chatId: data.chatId,
              createdAt: new Date().toISOString(),
              read: false
            }
          }));
          console.log(`Message forwarded to receiver: ${data.receiverId}`);
        } else {
          console.log(`Receiver ${data.receiverId} not connected`);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process request',
        error: error.message 
      }));
    }
  });
  
  ws.on('close', () => {
    console.log(`Client ${ws.userId || 'unknown'} disconnected`);
    if (ws.userId) {
      clients.delete(ws.userId);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server running on port 8080');