#!/usr/bin/env -S deno run --allow-all --unstable-kv
// Database backup script for Deno KV
// Exports all KV data to JSON files with timestamps
// NOTE: This script requires file system access and will NOT work on Deno Deploy

import { closeKv, getKv } from "./db.ts";
import { logger } from "./utils/logger.ts";

// Check if running on Deno Deploy (read-only filesystem)
const isDenoDeployment = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

if (isDenoDeployment) {
  console.error(
    "❌ Error: Backup/restore operations are not supported on Deno Deploy",
  );
  console.error(
    "💡 Tip: Deno Deploy uses managed Deno KV which is automatically backed up",
  );
  console.error("📖 See: https://deno.com/deploy/docs/kv for more information");
  Deno.exit(1);
}

interface BackupMetadata {
  timestamp: string;
  version: string;
  recordCount: number;
  collections: string[];
}

async function backupDatabase(outputDir: string): Promise<void> {
  logger.info("Starting database backup", { outputDir });

  try {
    // Ensure backup directory exists
    await Deno.mkdir(outputDir, { recursive: true });

    const kv = await getKv();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = `${outputDir}/backup-${timestamp}.json`;

    // Collect all data by prefix
    const collections: Record<string, unknown[]> = {
      users: [],
      members: [],
      events: [],
      attendance: [],
      rate_limits: [],
      failed_logins: [],
      account_locks: [],
    };

    let totalRecords = 0;

    // Backup users
    for await (const entry of kv.list({ prefix: ["user"] })) {
      collections.users.push({
        key: entry.key,
        value: entry.value,
        versionstamp: entry.versionstamp,
      });
      totalRecords++;
    }

    // Backup members
    for await (const entry of kv.list({ prefix: ["member"] })) {
      collections.members.push({
        key: entry.key,
        value: entry.value,
        versionstamp: entry.versionstamp,
      });
      totalRecords++;
    }

    // Backup events
    for await (const entry of kv.list({ prefix: ["event"] })) {
      collections.events.push({
        key: entry.key,
        value: entry.value,
        versionstamp: entry.versionstamp,
      });
      totalRecords++;
    }

    // Backup attendance (all prefixes)
    for await (const entry of kv.list({ prefix: ["attendance"] })) {
      collections.attendance.push({
        key: entry.key,
        value: entry.value,
        versionstamp: entry.versionstamp,
      });
      totalRecords++;
    }

    // Create backup metadata
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      recordCount: totalRecords,
      collections: Object.keys(collections).filter((k) =>
        collections[k].length > 0
      ),
    };

    // Write backup file
    const backup = {
      metadata,
      data: collections,
    };

    await Deno.writeTextFile(backupFile, JSON.stringify(backup, null, 2));

    logger.info("Backup completed successfully", {
      file: backupFile,
      recordCount: totalRecords,
      collections: metadata.collections,
    });

    // Clean up old backups (keep last 7 days)
    await cleanOldBackups(outputDir, 7);
  } catch (error) {
    logger.error("Backup failed", error);
    throw error;
  } finally {
    await closeKv();
  }
}

async function cleanOldBackups(
  backupDir: string,
  keepDays: number,
): Promise<void> {
  try {
    const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);

    for await (const entry of Deno.readDir(backupDir)) {
      if (
        entry.isFile && entry.name.startsWith("backup-") &&
        entry.name.endsWith(".json")
      ) {
        const filePath = `${backupDir}/${entry.name}`;
        const stat = await Deno.stat(filePath);

        if (stat.mtime && stat.mtime.getTime() < cutoffTime) {
          await Deno.remove(filePath);
          logger.info("Deleted old backup", { file: entry.name });
        }
      }
    }
  } catch (error) {
    logger.warn("Failed to clean old backups", { error: String(error) });
  }
}

async function restoreDatabase(backupFile: string): Promise<void> {
  logger.info("Starting database restore", { backupFile });

  try {
    const content = await Deno.readTextFile(backupFile);
    const backup = JSON.parse(content);

    logger.info("Backup file loaded", {
      recordCount: backup.metadata.recordCount,
      collections: backup.metadata.collections,
    });

    const kv = await getKv();
    let restoredCount = 0;

    // Restore each collection
    for (const [collectionName, records] of Object.entries(backup.data)) {
      if (!Array.isArray(records)) continue;

      for (const record of records) {
        try {
          await kv.set(record.key, record.value);
          restoredCount++;
        } catch (error) {
          logger.warn("Failed to restore record", {
            collection: collectionName,
            key: record.key,
            error: String(error),
          });
        }
      }
    }

    logger.info("Restore completed successfully", {
      restoredCount,
      requestedCount: backup.metadata.recordCount,
    });
  } catch (error) {
    logger.error("Restore failed", error);
    throw error;
  } finally {
    await closeKv();
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;
  const command = args[0];

  if (command === "backup") {
    const outputDir = args[1] || "./backups";
    await backupDatabase(outputDir);
  } else if (command === "restore") {
    const backupFile = args[1];
    if (!backupFile) {
      console.error("Error: Please specify backup file to restore");
      console.error(
        "Usage: deno run --allow-all --unstable-kv backup.ts restore <backup-file>",
      );
      Deno.exit(1);
    }
    await restoreDatabase(backupFile);
  } else {
    console.error("Usage:");
    console.error(
      "  Backup:  deno run --allow-all --unstable-kv backup.ts backup [output-dir]",
    );
    console.error(
      "  Restore: deno run --allow-all --unstable-kv backup.ts restore <backup-file>",
    );
    Deno.exit(1);
  }
}

export { backupDatabase, restoreDatabase };
