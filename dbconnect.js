import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// MongoDB URI stored in .env file
const MONGODB_URI = process.env.MONGODB_URI;
const globalForMongoose = global;
const cached = (globalForMongoose.__mongoose ??= {
    promise: null,
    connection: null,
});
async function dbConnect() {
    if (cached.connection)
        return cached.connection;
    if (!cached.promise) {
        // Setup options for the connection
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }
    try {
        cached.connection = await cached.promise;
        console.log("MongoDB Connected:", mongoose.connection.host);
    }
    catch (error) {
        cached.promise = null; // Reset connection
        cached.connection = null;
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit if unable to connect
    }
    return cached.connection;
}
export default dbConnect;
//# sourceMappingURL=dbconnect.js.map
