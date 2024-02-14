const io = require('socket.io');

const initializeSocket = (server) => {
  const socketIO = io(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  return socketIO
};

module.exports = {
  initializeSocket
};