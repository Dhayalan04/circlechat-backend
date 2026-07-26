const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const messageRoutes = require('./routes/messages');
const messageService = require('./services/messageService');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  });

app.get('/', (req, res) => {
  res.send('Server is running successfully !');
});

app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const broadcastEvent = (event) => {
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
};

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connection:accepted', payload: 'Welcome to CircleChat' }));

  socket.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'message:send' && data.payload && data.payload.text) {
        const newMessage = await messageService.createMessage({ text: data.payload.text });
        broadcastEvent({ type: 'message:created', payload: newMessage });
        return;
      }

      if (data.type === 'message:reply' && data.payload && data.payload.id && data.payload.text) {
        const updatedMessage = await messageService.addReply(data.payload.id, { text: data.payload.text });
        broadcastEvent({ type: 'message:replied', payload: updatedMessage });
        return;
      }

      socket.send(JSON.stringify({ type: 'error', payload: 'Invalid websocket event or payload' }));
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', payload: error.message }));
    }
  });
});

app.locals.broadcastEvent = broadcastEvent;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
