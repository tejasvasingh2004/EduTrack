import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseEmploymentReply } from '@/lib/llm/groq';

export async function POST(req: NextRequest) {
  try {
    const textBody = await req.text();
    const params = new URLSearchParams(textBody);
    const from = params.get('From');
    const body = params.get('Body');

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    const phone = from.replace('whatsapp:', '');
    const user = await (prisma.user as any).findFirst({
      where: { phoneNumber: phone }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const attempt = await prisma.reconciliationAttempt.findFirst({
      where: {
        studentId: user.id,
        status: 'AWAITING_REPLY'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!attempt) {
      return NextResponse.json({ error: 'No pending reconciliation attempt' }, { status: 400 });
    }

    const parsedData = await parseEmploymentReply(body);

    if (!parsedData) {
      // Graceful fallback: log as failed attempt instead of inserting garbage
      await prisma.reconciliationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'NO_RESPONSE',
        }
      });
      return new NextResponse('OK', { status: 200 }); // Twilio expects 200 OK
    }

    await prisma.$transaction(async (tx) => {
      await tx.employmentRecord.updateMany({
        where: { studentId: user.id, isCurrent: true },
        data: { isCurrent: false },
      });

      await tx.employmentRecord.create({
        data: {
          studentId: user.id,
          jobTitle: parsedData.jobTitle,
          company: parsedData.company,
          salaryBand: parsedData.salaryBand,
          isCurrent: true,
        },
      });

      await tx.reconciliationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'CONFIRMED',
          respondedAt: new Date(),
        }
      });
    });

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
