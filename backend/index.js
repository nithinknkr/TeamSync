const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chatRoutes = require('./routes/chatRoutes');
const taskRouter = require('./routes/taskRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to our routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a project's chat room
  socket.on('joinProject', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });
  
  // Handle team chat message
  socket.on('teamChatMessage', (message) => {
    // Broadcast the message to all users in the project room
    io.to(`project-${message.project}`).emit('newTeamMessage', message);
  });
  
  // Handle personal chat message
  socket.on('personalChatMessage', (message) => {
    // Broadcast the message only to sender and recipient
    io.to(`project-${message.project}`).emit('newPersonalMessage', message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/projects', projectRoutes);

// Nested routes for chat - each project has its own chat
app.use('/api/v1/projects/:projectId/chat', chatRoutes);

// Add this to your existing app.js file where you define your routes


// Add this to your middleware section
app.use('/api/v1/tasks', taskRouter);

// Root route
app.get('/', (req, res) => {
  res.send('TeamSync API is running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection successful!'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});