const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve your Express app
app.get('/', (req, res) => {
  res.send('WebSocket Server is Running');
});

// WebSocket Connection Handling (Primary Server)
wss.on('connection', (ws) => {
  console.log('Client connected to primary WebSocket server');

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`Received from client: ${message}`);

    // Forward received message to external WebSocket server
    if (externalWebSocket && externalWebSocket.readyState === WebSocket.OPEN) {
      externalWebSocket.send(message, (error) => {
        if (error) {
          console.error('Error sending message to external WebSocket:', error.message);
        }
      });
    } else {
      console.error('External WebSocket is not ready');
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected from primary WebSocket server');
  });
});

// Establish connection to external WebSocket server
const externalWebSocket = new WebSocket('wss://oxium.goecworld.com:5500/GOEC222'); // Replace with your external WebSocket server URL

externalWebSocket.on('open', () => {
  console.log('Connected to external WebSocket server');
});

externalWebSocket.on('message', (message) => {
  console.log(`Received from external WebSocket server: ${message}`);

  // Broadcast the received message to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
        const jsonData = JSON.parse(message); 
        client.send(JSON.stringify(jsonData));
    }
  });
});

externalWebSocket.on('close', () => {
  console.log('Disconnected from external WebSocket server');
});

externalWebSocket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

// Start the primary server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Primary WebSocket Server started on port ${PORT}`);
});
