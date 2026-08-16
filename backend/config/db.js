import mongoose from 'mongoose';
import { seedDefaultQuestions } from './seedQuestions.js';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/careersphere';
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully to CareerSphere database');

        // Seed initial questionnaire questions if collection is empty
        await seedDefaultQuestions();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;