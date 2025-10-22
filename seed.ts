// Seed script to create default admin account
import bcrypt from "bcryptjs";
import { getKv } from "./db.ts";

const kv = await getKv();

// Default admin credentials
const defaultAdmin = {
  email: "leodyversemilla07@gmail.com",
  password: "admin123", // Simple password for easy access
  name: "Admin User",
  role: "admin",
  organization: "QR Attends System",
};

console.log("🌱 Seeding database...");
console.log("📧 Creating/updating admin account:", defaultAdmin.email);

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

// Clear any account locks or failed attempts for admin
await kv.delete(["account_lock", defaultAdmin.email]);
await kv.delete(["failed_login_attempts", defaultAdmin.email]);

console.log("✅ Admin account created/updated successfully!");
console.log("\n📋 Login credentials:");
console.log("   Email:", defaultAdmin.email);
console.log("   Password:", defaultAdmin.password);
console.log("\n⚠️  IMPORTANT: Change the password after first login!");

console.log("\n✨ Seeding complete!");
