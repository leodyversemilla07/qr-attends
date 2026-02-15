import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
    checkRateLimit,
    generateSecureToken,
    logAuditEvent,
    validatePasswordStrength,
} from "../auth-helpers";

export const requestPasswordReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const allowed = await checkRateLimit(ctx, `reset:${args.email}`, 3, 3600000);
        if (!allowed) {
            throw new Error("Too many reset requests. Please try again in 1 hour.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address");
        }

        const officer = await ctx.db
            .query("officers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!officer) {
            return "If an account exists with that email, a reset link will be sent.";
        }

        const resetToken = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await ctx.db.insert("passwordResets", {
            officerId: officer._id,
            token: resetToken,
            expiresAt: expiresAt.toISOString(),
            used: false,
        });

        await logAuditEvent(ctx, "PASSWORD_RESET_REQUESTED", `Password reset requested for ${officer.email}`, officer._id.toString());

        return {
            message: "If an account exists with that email, a reset link will be sent.",
            resetToken: resetToken,
        };
    },
});

export const resetPassword = mutation({
    args: {
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const passwordValidation = validatePasswordStrength(args.newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(". "));
        }

        const resetRecord = await ctx.db
            .query("passwordResets")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!resetRecord) {
            throw new Error("Invalid or expired reset token");
        }

        if (resetRecord.used) {
            throw new Error("Reset token already used");
        }

        if (new Date(resetRecord.expiresAt) < new Date()) {
            throw new Error("Reset token expired");
        }

        const officer = await ctx.db.get(resetRecord.officerId);
        if (!officer) {
            throw new Error("Officer not found");
        }

        const hashedPassword = bcrypt.hashSync(args.newPassword, 12);
        await ctx.db.patch(officer._id, { password: hashedPassword });

        await ctx.db.patch(resetRecord._id, { used: true });

        await logAuditEvent(ctx, "PASSWORD_RESET_COMPLETED", `Password reset completed for ${officer.email}`, officer._id.toString());

        return "Password reset successfully. You can now login with your new password.";
    },
});
