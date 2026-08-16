import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { SkillProgressSchema } from '@/lib/validation/career.schema';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const authRes = await requireRole(['ADMIN', 'MENTOR']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

  try {
    const body = await req.json();
    const data = SkillProgressSchema.parse(body);

    if (authRes.user.role === 'MENTOR') {
       const assignment = await prisma.mentorStudent.findUnique({
          where: { studentId: data.studentId },
       });
       if (!assignment || assignment.mentorId !== authRes.user.userId) {
          return NextResponse.json({ error: 'Forbidden: You are not assigned to this student' }, { status: 403 });
       }
    }

    const record = await prisma.skillProgress.create({
      data: {
        studentId: data.studentId,
        skillName: data.skillName,
        level: data.level,
      },
    });

    return NextResponse.json(record);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
