const expressApp = require('./src/expressApp');
const http = require('http');
// const session = require('express-session');
const { initializeWhatsapp } = require('./src/whatsappClient');
const { initializeSocket } = require('./src/socketHandler');
const { initializeCardinal } = require('./src/cardinal');

const port = process.env.PORT || 8080;
const server = http.createServer(expressApp);

// Set up session middleware
// const sessionMiddleware = session({
//   secret: '7b6a98e6b0653c729484a302ad79889f3f2b02a06aa3dbcd83380b4c2f17d11d',
//   resave: false,
//   saveUninitialized: true
// });
// expressApp.use(sessionMiddleware);

const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
    const socketIO = await initializeSocket(server)
    const client = await initializeWhatsapp()

    initializeCardinal(socketIO, client)
    
    await client.initialize();
    console.log('Client initialized successfully!');
  } catch(error) {
    console.error('Error starting server:', error);
  }
}

startServer()
