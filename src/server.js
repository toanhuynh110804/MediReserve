const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config({ override: true });

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || '*',
      },
    });

    app.set('io', io);

    io.on('connection', (socket) => {
      socket.on('join-user-room', (payload = {}) => {
        if (payload.userId) {
          socket.join(`user:${payload.userId}`);
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing server process or change PORT in .env.`);
        process.exit(1);
      }

      console.error('Server failed to start', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
