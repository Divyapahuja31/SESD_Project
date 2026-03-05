import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title too long"),
});
export const drawPayloadSchema = z.object({
  boardId: z.string().min(1, "boardId is required"),
  points: z
    .array(z.tuple([z.number(), z.number()]))
    .min(1, "Points array cannot be empty"),
  color: z.string().min(1, "Color is required"),
  size: z.number().min(1).max(100),
  tool: z.string().optional(),
});

export const joinBoardSchema = z.object({
  boardId: z.string().min(1, "boardId is required"),
});

export const undoSchema = z.object({
  boardId: z.string().min(1, "boardId is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type DrawPayloadInput = z.infer<typeof drawPayloadSchema>;
