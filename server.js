const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  override: process.env.NODE_ENV !== 'production'
});

const connectDB = require('./config/db');
const app = require('./app');

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`[SERVER] ResumeBuilder running on port ${port}`);
    console.log(`[SERVER] Open http://${host}:${port}`);
  });
};

startServer().catch((error) => {
  console.error('[SERVER] Failed to start application:', error.message);
  process.exit(1);
});

if (process.env.VERCEL) {
  module.exports = app;
}
