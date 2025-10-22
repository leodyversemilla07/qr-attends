// Migration script to update existing attendance records with full member data
import { getKv } from "./db.ts";

interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  studentId?: string;
  yearSection?: string;
  cardNo?: string;
}

interface Member {
  firstName: string;
  lastName: string;
  middleInitial: string;
  studentId?: string;
  yearSection?: string;
  cardNo?: string;
}

const kv = await getKv();

console.log("🔄 Migrating attendance records...");

let updatedCount = 0;
let errorCount = 0;

// Get all attendance records
const attendanceEntries = kv.list<AttendanceRecord>({ prefix: ["attendance"] });

for await (const entry of attendanceEntries) {
  const record = entry.value;

  // Skip if this is already updated (has firstName field)
  if (record.firstName) {
    continue;
  }

  try {
    // Get member data
    const memberResult = await kv.get(["member", record.userId]);

    if (memberResult.value) {
      const member = memberResult.value as Member;

      // Update record with full member data
      const updatedRecord = {
        ...record,
        firstName: member.firstName,
        lastName: member.lastName,
        middleInitial: member.middleInitial,
        studentId: member.studentId,
        yearSection: member.yearSection,
        cardNo: member.cardNo,
        userName:
          `${member.firstName} ${member.middleInitial}. ${member.lastName}`,
        userEmail: member.studentId || "",
      };

      // Save updated record
      await kv.set(["attendance", record.eventId, record.id], updatedRecord);
      await kv.set(
        ["attendance_by_user", record.userId, record.id],
        updatedRecord,
      );

      updatedCount++;
      console.log(
        `✅ Updated: ${member.firstName} ${member.lastName} (${member.studentId})`,
      );
    } else {
      console.log(`⚠️  Member not found for userId: ${record.userId}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`❌ Error updating record ${record.id}:`, error);
    errorCount++;
  }
}

console.log(`\n✨ Migration complete!`);
console.log(`   - Updated: ${updatedCount} records`);
console.log(`   - Errors: ${errorCount} records`);
