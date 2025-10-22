#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

/**
 * Migration script to add email indexes to existing users
 * Run this once after deploying the performance optimizations
 */

import { getKv } from "./db.ts";

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}

console.log("🔄 Migrating existing users to add email indexes...\n");

const kv = await getKv();
let migratedCount = 0;
let errorCount = 0;

try {
  // Get all existing users
  const userEntries = kv.list<User>({ prefix: ["user"] });

  for await (const entry of userEntries) {
    const user = entry.value;

    // Skip if this is an email index entry (not a user ID entry)
    if (typeof entry.key[1] !== "string" || entry.key[1].includes("@")) {
      continue;
    }

    try {
      // Check if email index already exists
      const existingIndex = await kv.get(["user_by_email", user.email]);

      if (!existingIndex.value) {
        // Create email index for this user
        await kv.set(["user_by_email", user.email], user);
        console.log(`✅ Added email index for: ${user.email}`);
        migratedCount++;
      } else {
        console.log(`⏭️  Email index already exists for: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating user ${user.email}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   - Migrated: ${migratedCount} users`);
  console.log(`   - Errors: ${errorCount}`);

  if (migratedCount === 0 && errorCount === 0) {
    console.log(`   ℹ️  No users needed migration (indexes already exist)`);
  }
} catch (error) {
  console.error("❌ Migration failed:", error);
  Deno.exit(1);
}

console.log("\n🎉 You can now use the optimized authentication system!");
