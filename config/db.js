// ─────────────────────────────────────────────────────────────
//  config/db.js
//  PURPOSE : Connect the app to MongoDB
//  CALLED  : Once at server startup (inside server.js)
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Read the connection string from .env and connect
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1); // exit code 1 = something went wrong
  }
};

module.exports = connectDB;
