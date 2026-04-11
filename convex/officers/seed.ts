import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
    getAuthenticatedOfficer,
    logAuditEvent,
} from "../authHelpers";

function generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + special;

    function randomInt(max: number): number {
        const bytes = new Uint8Array(1);
        crypto.getRandomValues(bytes);
        return bytes[0] % max;
    }

    const chars = [
        uppercase[randomInt(uppercase.length)],
        lowercase[randomInt(lowercase.length)],
        numbers[randomInt(numbers.length)],
        special[randomInt(special.length)],
    ];

    for (let i = 0; i < 8; i++) {
        chars.push(all[randomInt(all.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        const temp = chars[i];
        chars[i] = chars[j];
        chars[j] = temp;
    }

    return chars.join('');
}

export const seedInitialOfficer = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("officers").first();
        if (existing) return "Already seeded. Use resetSeedPassword to reset credentials.";

        const adminEmail = process.env.ADMIN_EMAIL || "admin@qr-attends.local";
        const adminName = process.env.ADMIN_NAME || "System Administrator";
        const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword();

        const hashedPassword = bcrypt.hashSync(adminPassword, 12);

        await ctx.db.insert("officers", {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "President",
        });

        console.log(`[SEED] Created admin account: ${adminEmail}`);
        if (!process.env.ADMIN_PASSWORD) {
            console.log(`[SEED] Generated password (SAVE THIS!): ${adminPassword}`);
        }

        await logAuditEvent(ctx, "SEED_ADMIN", `Initial admin account created: ${adminEmail}`);

        return process.env.ADMIN_PASSWORD
            ? `Seeded admin: ${adminEmail} (password from environment)`
            : `Seeded admin: ${adminEmail} - Check Convex logs for generated password`;
    },
});

export const resetSeedPassword = mutation({
    args: {
        token: v.string(),
        newPassword: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const actor = await getAuthenticatedOfficer(ctx, args.token);

        if (actor.role !== "President" && actor.role !== "Admin") {
            throw new Error("Forbidden: Admin role required");
        }

        const officer = await ctx.db.query("officers").first();

        if (!officer) {
            throw new Error("No officer account found. Run seedInitialOfficer first.");
        }

        const newPassword = args.newPassword || process.env.ADMIN_PASSWORD || generateSecurePassword();
        const hashedPassword = bcrypt.hashSync(newPassword, 12);

        await ctx.db.patch(officer._id, {
            password: hashedPassword,
        });

        console.log(`[RESET] Password reset for: ${officer.email}`);
        if (!args.newPassword && !process.env.ADMIN_PASSWORD) {
            console.log(`[RESET] New generated password: ${newPassword}`);
        }

        await logAuditEvent(
            ctx,
            "PASSWORD_RESET_ADMIN",
            `Admin password reset for ${officer.email}`,
            actor._id.toString()
        );

        return `Password reset for ${officer.email} - Check Convex logs for new password`;
    },
});
