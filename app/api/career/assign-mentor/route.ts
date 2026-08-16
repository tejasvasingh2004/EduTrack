import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const assignMentorSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  mentorId: z.string().uuid('Invalid mentor ID'),
});

export async function POST(req: NextRequest) {
  const authRes = await requireRole(['ADMIN']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

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
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
