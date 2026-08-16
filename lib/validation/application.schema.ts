import { z } from "zod";

export const ApplicationSubmitSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must provide consent",
  }),
});

export const ApplicationStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "WAITLISTED"]),
});
