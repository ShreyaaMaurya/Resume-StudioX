const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[DATABASE] MongoDB Connected Layer: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DATABASE_ERROR] Connection failure payload: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;