import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { scrapeLinkedInProfile } from '@/lib/scraper/apify';
import { sendWhatsAppTemplate } from '@/lib/whatsapp/twilio';

export async function POST(req: NextRequest) {
  const authRes = await requireRole(['ADMIN']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        consentGiven: true,
        linkedinUrl: { not: null },
      },
      include: {
        employmentRecords: {
          where: { isCurrent: true },
          take: 1,
        }
      }
    });

    const results = [];

    for (const student of students) {
      const attempt = await prisma.reconciliationAttempt.create({
        data: {
          studentId: student.id,
          status: 'PENDING_SCRAPE',
          scheduledFor: new Date(),
        }
      });

      const scrapedData = await scrapeLinkedInProfile(student.linkedinUrl!);
      
      // If scraping failed or returned nothing, treat it as a skipped/failed attempt
      if (!scrapedData) {
        await prisma.reconciliationAttempt.update({
          where: { id: attempt.id },
          data: { status: 'NO_RESPONSE' } // Log as failed attempt without crashing
        });
        results.push({ studentId: student.id, status: 'NO_RESPONSE_SCRAPE_FAILED' });
        continue;
      }

      const currentJob = student.employmentRecords[0];

      if (currentJob && currentJob.jobTitle === scrapedData.jobTitle && currentJob.company === scrapedData.company) {
        await prisma.reconciliationAttempt.update({
          where: { id: attempt.id },
          data: { status: 'NO_CHANGE_SKIPPED' }
        });
        results.push({ studentId: student.id, status: 'NO_CHANGE_SKIPPED' });
      } else {
        const phone = student.phoneNumber;
        if (!phone) {
          console.warn(`Skipping WhatsApp message for ${student.email} - no phone number`);
          await prisma.reconciliationAttempt.update({
            where: { id: attempt.id },
            data: { status: 'NO_RESPONSE' }
          });
          results.push({ studentId: student.id, status: 'SKIPPED_NO_PHONE' });
          continue;
        }

        await sendWhatsAppTemplate(phone, scrapedData.jobTitle, scrapedData.company);

        await prisma.reconciliationAttempt.update({
          where: { id: attempt.id },
          data: { status: 'AWAITING_REPLY' }
        });
        results.push({ studentId: student.id, status: 'AWAITING_REPLY' });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
