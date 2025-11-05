// lib/mongo.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI not set");

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function connect() {
  if (db) return { client, db };
  if (!client) {
    client = new MongoClient(uri);
    // In dev, reuse existing client
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = client.connect();
    }
    await global._mongoClientPromise;
    db = client.db(); // uses database from URI
  }
  return { client, db };
}

export default connect;
