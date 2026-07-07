import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200),
  email: z.email("Please enter a valid email").max(320),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(5000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name").max(200),
    email: z.email("Please enter a valid email").max(320),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72),
    confirmPassword: z.string(),
    role: z.enum(["student", "mentor"]),
    schoolName: z.string().trim().max(200).optional(),
    grade: z.enum(["8", "9"]).optional(),
    parentalConsent: z.boolean(),
    parentGuardianName: z.string().trim().max(200).optional(),
    parentGuardianContact: z.string().trim().max(100).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.role !== "student" || !!d.schoolName, {
    message: "School name is required for students",
    path: ["schoolName"],
  })
  .refine((d) => d.role !== "student" || !!d.grade, {
    message: "Grade is required for students",
    path: ["grade"],
  })
  .refine((d) => d.role !== "student" || d.parentalConsent, {
    message: "Parental consent is required for students",
    path: ["parentalConsent"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  body: z.string().trim().min(10, "Post must be at least 10 characters").max(20000),
  categoryId: z.uuid(),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(5000),
  postId: z.uuid(),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  conversationId: z.uuid(),
});

export const sessionScoreSchema = z.object({
  bookingId: z.uuid(),
  studentId: z.uuid(),
  creativityScore: z.number().int().min(1).max(5),
  executionScore: z.number().int().min(1).max(5),
  presentationScore: z.number().int().min(1).max(5),
  feedbackText: z.string().trim().max(5000).optional(),
});
