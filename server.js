const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const messageRoutes = require('./routes/messages');
const messageService = require('./services/messageService');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS: allow client application origins. Configure via CLIENT_ORIGIN env var (comma-separated)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser (e.g., curl, server-to-server) requests when origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

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
