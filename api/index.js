const connectDB = require('../config/db');
const app = require('../app');

let dbConnection;

module.exports = async (req, res) => {
  if (!dbConnection) {
    dbConnection = connectDB();
  }

  await dbConnection;
  return app(req, res);
};