import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
    generateSecureToken,
    logAuditEvent,
} from "../auth-helpers";

function generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 0; i < 8; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
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
        token: v.optional(v.string()),
        newPassword: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const officer = await ctx.db.query("officers").first();

        if (!officer) {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@qr-attends.local";
            const adminName = process.env.ADMIN_NAME || "System Administrator";
            const adminPassword = args.newPassword || process.env.ADMIN_PASSWORD || generateSecurePassword();

            const hashedPassword = bcrypt.hashSync(adminPassword, 12);
            await ctx.db.insert("officers", {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "President",
            });

            console.log(`[RESET] Created new admin: ${adminEmail}`);
            if (!args.newPassword && !process.env.ADMIN_PASSWORD) {
                console.log(`[RESET] Generated password: ${adminPassword}`);
            }

            return `Created new admin: ${adminEmail} - Check Convex logs for password`;
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

        await logAuditEvent(ctx, "PASSWORD_RESET_ADMIN", `Admin password reset for ${officer.email}`);

        return `Password reset for ${officer.email} - Check Convex logs for new password`;
    },
});
