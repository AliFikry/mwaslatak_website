const mongoose = require('mongoose');

// MongoDB connection configuration
const connectDB = async () => {
    try {
        // Simplified connection options
        const options = {};

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://alifikry939_db_user:UEDV5sNO5PRTKh2C@cluster0.lzz9rgq.mongodb.net/mwaslatak-transport?retryWrites=true&w=majority', options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;