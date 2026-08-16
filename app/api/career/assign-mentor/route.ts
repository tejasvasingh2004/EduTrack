import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const assignMentorSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  mentorId: z.string().uuid('Invalid mentor ID'),
});

export async function POST(req: NextRequest) {
  const authRes = await requireRole(req, ['ADMIN']);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await req.json();
    const data = assignMentorSchema.parse(body);

    const record = await prisma.mentorStudent.upsert({
      where: { studentId: data.studentId },
      update: { mentorId: data.mentorId },
      create: { studentId: data.studentId, mentorId: data.mentorId },
    });

    return NextResponse.json(record);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
