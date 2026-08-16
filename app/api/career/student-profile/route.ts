import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authRes = await requireRole(['ADMIN', 'MENTOR', 'STUDENT']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId query param is required' }, { status: 400 });
  }

  // RBAC checks
  if (authRes.user.role === 'STUDENT' && authRes.user.userId !== studentId) {
    return NextResponse.json({ error: 'Forbidden: Can only view own profile' }, { status: 403 });
  }
  if (authRes.user.role === 'MENTOR') {
    const assignment = await prisma.mentorStudent.findUnique({
      where: { studentId: studentId },
    });
    if (!assignment || assignment.mentorId !== authRes.user.userId) {
       return NextResponse.json({ error: 'Forbidden: Not assigned to this student' }, { status: 403 });
    }
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        mentor: {
          include: { mentor: { select: { id: true, email: true } } }
        },
        skills: {
          orderBy: { createdAt: 'desc' }
        },
        employmentRecords: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { passwordHash, ...safeProfile } = profile;

    return NextResponse.json(safeProfile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
