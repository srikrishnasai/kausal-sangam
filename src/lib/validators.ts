import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  availability: z.string().trim().max(160).optional().or(z.literal("")),
  avatarUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
});

export const userSkillSchema = z.object({
  skillName: z.string().trim().min(2, "Pick or type a skill").max(60),
  kind: z.enum(["OFFER", "WANT"]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  description: z.string().trim().max(240).optional().or(z.literal("")),
});

export const swapRequestSchema = z.object({
  toUserId: z.string().min(1),
  requestedSkillId: z.string().min(1, "Choose a skill you want to learn"),
  offeredSkillId: z.string().min(1, "Choose a skill you can teach in return"),
  message: z.string().trim().min(10, "Add a short note (at least 10 characters)").max(800),
});

export const messageSchema = z.object({
  swapRequestId: z.string().min(1),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export const reviewSchema = z.object({
  swapRequestId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  comment: z.string().trim().max(600).optional().or(z.literal("")),
});
