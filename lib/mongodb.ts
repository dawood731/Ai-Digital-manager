import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. Try configured Atlas URI first
      if (MONGODB_URI) {
        try {
          const m = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 4000,
            bufferCommands: false,
          });
          console.log("[MongoDB] Connected to MongoDB Atlas cluster.");
          return m;
        } catch (err: any) {
          console.warn(
            "[MongoDB] Atlas connection failed. Switching to resilient local/memory database fallback..."
          );
        }
      }

      // 2. Dynamic fallback using eval to prevent webpack static bundling issues
      try {
        const req = eval("require");
        const { MongoMemoryServer } = req("mongodb-memory-server");
        if (!cached.memoryServer) {
          cached.memoryServer = await MongoMemoryServer.create({
            instance: { dbName: "ai_digital_manager" },
          });
        }
        const uri = cached.memoryServer.getUri();
        const m = await mongoose.connect(uri, {
          bufferCommands: false,
        });
        console.log(`[MongoDB] Connected to development MongoDB fallback at ${uri}`);
        return m;
      } catch (fallbackErr: any) {
        console.error("[MongoDB] Failed to connect to MongoDB:", fallbackErr);
        throw fallbackErr;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
