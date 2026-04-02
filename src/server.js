const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config({ override: true });

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
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
