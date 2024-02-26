const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const ip = require('ip');

const app = express();
const server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
}, app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (iceCandidate) => {
    socket.broadcast.emit('ice-candidate', iceCandidate);
  });
});

const PORT = process.env.PORT || 3000;
const ipv4Address = ip.address();
server.listen(PORT, () => {
  console.log(`Server is running on https://${ipv4Address}:${PORT} and https://localhost:${PORT}`);
});
