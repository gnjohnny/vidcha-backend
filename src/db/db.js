import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Db connected successfully", conn.connection.host)
    } catch (error) {
        console.log("Error connecting db", error.message);
        process.exit(1)
    }
}