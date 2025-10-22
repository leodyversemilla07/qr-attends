// Input validation schemas using Zod
import { z } from "zod";

// Password complexity validation
export const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

// Auth validation schemas
export const loginSchema = z.object({
  action: z.literal("login"),
  email: z.string()
    .email("Invalid email format")
    .min(3, "Email must be at least 3 characters")
    .max(255, "Email must be at most 255 characters")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const changePasswordSchema = z.object({
  action: z.literal("change_password"),
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const changeEmailSchema = z.object({
  action: z.literal("change_email"),
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newEmail: z.string()
    .email("Invalid email format")
    .min(3, "Email must be at least 3 characters")
    .max(255, "Email must be at most 255 characters")
    .toLowerCase()
    .trim(),
});

// Member validation schemas
export const memberSchema = z.object({
  id: z.string()
    .uuid("Invalid UUID format")
    .trim(),
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .trim(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .trim(),
  middleInitial: z.string()
    .min(1, "Middle initial is required")
    .max(10, "Middle initial must be at most 10 characters")
    .regex(
      /^[a-zA-Z.]+$/,
      "Middle initial can only contain letters and periods",
    )
    .trim(),
  studentId: z.string()
    .min(3, "Student ID is required")
    .max(50, "Student ID must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Student ID can only contain letters, numbers, and hyphens",
    )
    .trim(),
  yearSection: z.string()
    .min(1, "Year/Section is required")
    .max(50, "Year/Section must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-]+$/,
      "Year/Section can only contain letters, numbers, spaces, and hyphens",
    )
    .trim(),
  cardNo: z.string()
    .min(1, "Card number is required")
    .max(50, "Card number must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Card number can only contain letters, numbers, and hyphens",
    )
    .trim(),
});

export const memberUpdateSchema = memberSchema.partial().omit({ id: true });

// Event validation schemas
export const eventCreateSchema = z.object({
  name: z.string()
    .min(1, "Event name is required")
    .max(200, "Event name must be at most 200 characters")
    .trim(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must be at most 200 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .trim()
    .optional()
    .default(""),
  createdBy: z.string()
    .uuid("Invalid user ID format")
    .trim(),
});

export const eventUpdateSchema = z.object({
  id: z.string()
    .uuid("Invalid event ID format")
    .trim(),
  name: z.string()
    .min(1, "Event name is required")
    .max(200, "Event name must be at most 200 characters")
    .trim()
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
    .optional(),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must be at most 200 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .trim()
    .optional(),
});

// Attendance validation schemas
export const attendanceRecordSchema = z.object({
  eventId: z.string()
    .uuid("Invalid event ID format")
    .trim(),
  userId: z.string()
    .uuid("Invalid user ID format")
    .trim(),
});

// UUID validation
export const uuidSchema = z.string()
  .uuid("Invalid UUID format")
  .trim();

// Helper function to validate and sanitize input
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message || "Invalid input",
      };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Sanitize HTML to prevent XSS (basic implementation)
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
