import 'dotenv/config';
import { prisma } from '../lib/db.js';

async function seed() {
  try {
    const student = await prisma.user.upsert({
      where: { email: 'test_student@example.com' },
      update: { linkedinUrl: 'https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a' },
      create: { 
        email: 'test_student@example.com', 
        passwordHash: 'hash', 
        role: 'STUDENT', 
        consentGiven: true, 
        linkedinUrl: 'https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a' 
      }
    });

    const mentor = await prisma.user.upsert({
      where: { email: 'test_mentor@example.com' },
      update: {},
      create: { email: 'test_mentor@example.com', passwordHash: 'hash', role: 'MENTOR' }
    });

    console.log(`PASS: Seeded Student ID: ${student.id}`);
    console.log(`PASS: Seeded Mentor ID: ${mentor.id}`);
  } catch (err) {
    console.error('FAIL: Database seed failed', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
