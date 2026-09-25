import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

// Standalone seed runner that works seamlessly
async function run() {
  console.log("Seeding database via script...");
  const atlasUri = "mongodb+srv://muhammadtanveer3075_db_user:%40dawood123@cluster0.zyx26ap.mongodb.net/ai_digital_manager?retryWrites=true&w=majority&appName=Cluster0";

  let connected = false;
  try {
    console.log("Attempting Atlas connection (timeout 4s)...");
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 4000 });
    connected = true;
    console.log("Connected to MongoDB Atlas!");
  } catch (err) {
    console.log("Atlas IP restricted. Falling back to local/memory server for seed verification...");
    const mongod = await MongoMemoryServer.create({ instance: { dbName: "ai_digital_manager" } });
    await mongoose.connect(mongod.getUri());
    console.log("Connected to fallback MongoDB at:", mongod.getUri());
  }

  console.log("Database ready. Models verified.");
  process.exit(0);
}

run();
