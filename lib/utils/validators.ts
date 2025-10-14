import { z } from "zod";

/**
 * Topic creation schema
 */
export const createTopicSchema = z.object({
  bof_session_id: z.string().uuid(),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

/**
 * Vote schema
 */
export const castVoteSchema = z.object({
  topic_id: z.string().uuid(),
  bof_session_id: z.string().uuid(),
});

/**
 * Participant schema
 */
export const participantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  company: z.string().max(255).optional(),
});

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

/**
 * UUID validation
 */
export function isValidUUID(uuid: string): boolean {
  return z.string().uuid().safeParse(uuid).success;
}
