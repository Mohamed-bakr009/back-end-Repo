
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const collections = [
  { file: "categories.json", name: "categories" },
  { file: "subcategories.json", name: "subcategories" },
  { file: "seasons.json", name: "seasons" },
  { file: "shippingfees.json", name: "shippingfees" },
  { file: "policies.json", name: "policies" },
  { file: "users.json", name: "users" },
  { file: "products.json", name: "products" },
  { file: "testimonials.json", name: "testimonials" },
];


function reviveExtendedJSON(value) {
  if (Array.isArray(value)) return value.map(reviveExtendedJSON);
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return new mongoose.Types.ObjectId(value.$oid);
    if (typeof value.$date === "string") return new Date(value.$date);
    const out = {};
    for (const key of Object.keys(value)) out[key] = reviveExtendedJSON(value[key]);
    return out;
  }
  return value;
}

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  for (const { file, name } of collections) {
    const filePath = path.join(__dirname, "seed-data", file);
    if (!fs.existsSync(filePath)) {
      console.log(`skip ${file} (not found)`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const docs = reviveExtendedJSON(raw);
    await db.collection(name).deleteMany({});
    if (docs.length) await db.collection(name).insertMany(docs);
    console.log(`seeded ${name}: ${docs.length} document(s)`);
  }

  console.log("\nDone. Admin login -> username: mohamed | password: 12345678");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
