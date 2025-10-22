// Seed script to create default admin account
import bcrypt from "bcryptjs";
import { getKv } from "./db.ts";

const kv = await getKv();

// Generate a secure random password
function generateSecurePassword(length = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

// Generate random password for admin
const adminPassword = generateSecurePassword(16);

// Default admin credentials
const defaultAdmin = {
  email: "admin@qr-attends.local",
  password: adminPassword, // This will be hashed
  name: "Admin User",
  role: "admin",
  organization: "QR Attends System",
};

console.log("🌱 Seeding database...");
console.log("📧 Creating admin account:", defaultAdmin.email);

// Hash the password
const hashedPassword = await bcrypt.hash(defaultAdmin.password, 12);

// Create user object
const user = {
  id: crypto.randomUUID(),
  email: defaultAdmin.email,
  password: hashedPassword,
  passwordHash: hashedPassword,
  name: defaultAdmin.name,
  role: defaultAdmin.role,
  organization: defaultAdmin.organization,
  createdAt: new Date().toISOString(),
};

// Save to KV store with email index for fast lookups
await kv.atomic()
  .set(["user", user.id], user)
  .set(["user_by_email", user.email], user)
  .commit();

console.log("✅ Admin account created successfully!");
console.log("\n📋 Login credentials:");
console.log("   Email:", defaultAdmin.email);
console.log("   Password:", defaultAdmin.password);
console.log("\n⚠️  IMPORTANT: Change the password after first login!");

console.log("\n✨ Seeding complete!");
