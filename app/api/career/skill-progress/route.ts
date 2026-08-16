import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { skillProgressSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const authRes = await requireRole(req, ['ADMIN', 'MENTOR']);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await req.json();
    const data = skillProgressSchema.parse(body);

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
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
