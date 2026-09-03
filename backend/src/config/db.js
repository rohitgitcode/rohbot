import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true, // Dev me auto-index deployment fast karta hai
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Database Connection Error: ${error.message}`);
    process.exit(1); // prod rule ( db fail then terminate safely)
  }
};

const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(` MongoDB connection closed due to ${signal}`);
    process.exit(0);
  } catch (err) {
    console.error(` Error during graceful DB shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;