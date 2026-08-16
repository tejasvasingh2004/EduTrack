import 'dotenv/config';
import { prisma } from '../lib/db.js';
import { NextRequest } from 'next/server.js';
import { POST as assignMentor } from '../app/api/career/assign-mentor/route.js';
import { POST as skillProgress } from '../app/api/career/skill-progress/route.js';
import { POST as employmentRecord } from '../app/api/career/employment-record/route.js';
import { GET as studentProfile } from '../app/api/career/student-profile/route.js';
import { POST as chatbotQuery } from '../app/api/chatbot/query/route.js';

async function run() {
  console.log('--- 1. Setup ---');
  if (!process.env.APIFY_API_TOKEN || !process.env.APIFY_ACTOR_ID || !process.env.GROQ_API_KEY) {
    console.log('FAIL: Missing required environment variables.');
    return;
  }
  
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

    console.log('PASS: Seeded Student ID:', student.id, 'Mentor ID:', mentor.id);

    console.log('\n--- 2. Career tracking API ---');
    
    // Test assign-mentor
    console.log('Calling POST /api/career/assign-mentor');
    const req1 = new NextRequest('http://localhost/api/career/assign-mentor', {
      method: 'POST',
      body: JSON.stringify({ studentId: student.id, mentorId: mentor.id })
    });
    // Assume auth mock or see if it crashes due to missing lib/auth
    try {
      const res1 = await assignMentor(req1);
      console.log('Response:', await res1.json());
    } catch (e) {
      console.log('FAIL:', e.message);
      return;
    }
  } catch (err) {
    console.error('FAIL:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
