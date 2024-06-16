const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});



io.on('connection', (socket) => {
  console.log('A user connected');

  // When a client sends their email, join them to a room with that email
  socket.on('join', (email) => {
    socket.join(email);
  });
  
    socket.on('update',(m)=>{
        io.to(m).emit('update')
    })
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});