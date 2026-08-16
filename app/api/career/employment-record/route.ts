import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { EmploymentRecordSchema } from '@/lib/validation/career.schema';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const authRes = await requireRole(['ADMIN']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

  try {
    const body = await req.json();
    const data = EmploymentRecordSchema.parse(body);

    const record = await prisma.$transaction(async (tx) => {
      if (data.isCurrent) {
        await tx.employmentRecord.updateMany({
          where: { studentId: data.studentId, isCurrent: true },
          data: { isCurrent: false },
        });
      }

      return tx.employmentRecord.create({
        data: {
          studentId: data.studentId,
          jobTitle: data.jobTitle,
          company: data.company,
          salaryBand: data.salaryBand,
          isCurrent: data.isCurrent,
        },
      });
    });

    return NextResponse.json(record);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
