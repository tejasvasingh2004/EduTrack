import { z } from "zod";

export const EmploymentRecordSchema = z.object({
  studentId: z.string().uuid(),
  jobTitle: z.string().min(2),
  company: z.string().min(2),
  salaryBand: z.string().optional(),
  isCurrent: z.boolean().default(true),
});

export const SkillProgressSchema = z.object({
  studentId: z.string().uuid(),
  skillName: z.string().min(2),
  level: z.number().int().min(1).max(5), // assuming 1-5 scale
});
