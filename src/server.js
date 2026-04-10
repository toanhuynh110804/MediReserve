const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { ensureSystemAdminAccount } = require('./config/systemAdmin');
const { ensureSystemHospital } = require('./config/systemHospital');

dotenv.config({ override: true });

const PORT = process.env.PORT || 4000;

connectDB()
  .then(async () => {
    await ensureSystemAdminAccount();
    await ensureSystemHospital();

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

      // Tham gia phòng chat (bệnh nhân join phòng của mình, staff join phòng của bệnh nhân)
      socket.on('chat:join', (payload = {}) => {
        if (payload.roomId) {
          socket.join(`chat:${payload.roomId}`);
        }
      });

      // Nhận và phát tin nhắn qua socket (real-time)
      socket.on('chat:send', async (payload = {}) => {
        const { roomId, content, senderId, senderRole, senderName } = payload;
        if (!roomId || !content?.trim() || !senderId) return;

        try {
          const ChatMessage = require('./models/ChatMessage');
          const msg = await ChatMessage.create({
            roomId,
            sender: senderId,
            senderRole: senderRole || 'patient',
            content: content.trim(),
          });

          const populated = await ChatMessage.findById(msg._id).populate('sender', 'name email role');
          io.to(`chat:${roomId}`).emit('chat:message', populated);
        } catch (err) {
          socket.emit('chat:error', { message: 'Gửi tin nhắn thất bại.' });
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
