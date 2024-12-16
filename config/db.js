const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://vicki:1234@memorykeeper.eve4x.mongodb.net/?retryWrites=true&w=majority&appName=memorykeeper";

const client = new MongoClient(uri, {
  autoSelectFamily: false, // required for node version over v18
});

async function connectToDatabase() {
  console.log("Connecting to MongoDB...");
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    return client.db("blog");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

module.exports = connectToDatabase;
