import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const atlasUri = "mongodb+srv://muhammadtanveer3075_db_user:%40dawood123@cluster0.zyx26ap.mongodb.net/ai_digital_manager?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  console.log("Testing Atlas connection (timeout 4s)...");
  try {
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 4000 });
    console.log("Connected to MongoDB Atlas successfully!");
  } catch (err) {
    console.log("Atlas IP whitelist restricted or timed out. Testing MongoMemoryServer fallback...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log("Started in-memory MongoDB at:", uri);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB fallback successfully! Host:", mongoose.connection.host);
    await mongoose.disconnect();
    await mongod.stop();
    console.log("Test finished cleanly.");
  }
}

testConnection();
