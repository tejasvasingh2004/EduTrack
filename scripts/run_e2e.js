const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  let failures = 0;
  function assert(condition, message) {
    if (!condition) { console.error('❌ FAIL:', message); failures++; throw new Error(message); }
  }

  try {
    // --- 2. AUTH ---
    await prisma.application.deleteMany();
    await prisma.mentorStudent.deleteMany();
    await prisma.employmentRecord.deleteMany();
    await prisma.skillProgress.deleteMany();
    await prisma.chatbotQuery.deleteMany();
    await prisma.reconciliationAttempt.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: ['admin@test.com', 'mentor@test.com', 'student@test.com', 'applicant2@test.com'] } } });

    await fetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'student@test.com', password: 'Password123!', linkedinUrl: 'https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a', consentGiven: true }) });
    await fetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'mentor@test.com', password: 'Password123!', consentGiven: true }) });
    await fetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@test.com', password: 'Password123!', consentGiven: true }) });

    await prisma.user.update({ where: { email: 'mentor@test.com' }, data: { role: 'MENTOR' } });
    await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'ADMIN' } });

    let adminCookie = (await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@test.com', password: 'Password123!' }) })).headers.get('set-cookie').split(';')[0];
    let studentCookie = (await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'student@test.com', password: 'Password123!' }) })).headers.get('set-cookie').split(';')[0];
    let mentorCookie = (await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'mentor@test.com', password: 'Password123!' }) })).headers.get('set-cookie').split(';')[0];

    // RBAC & Logout
    let res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { 'Cookie': studentCookie } });
    assert(res.status === 403, `RBAC Failed: Expected 403, got ${res.status}`);
    res = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', headers: { 'Cookie': adminCookie } });
    assert(res.headers.get('set-cookie').includes('Expires=Thu, 01 Jan 1970'), 'Logout did not clear cookie');
    console.log('✅ Section 2: Auth passed');

    // --- 3. APPLICATION PIPELINE ---
    // Submit application (no auth) creates user AND application
    res = await fetch(`${BASE_URL}/api/applications/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'applicant2@test.com', password: 'Password123!', phoneNumber: '+919867171270', linkedinUrl: 'https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a', consentGiven: true })
    });
    let submitData = await res.json();
    assert(res.status === 201, 'Submit application failed: ' + JSON.stringify(submitData));
    
    let applicant2User = await prisma.user.findUnique({ where: { email: 'applicant2@test.com' } });
    let dbApp = await prisma.application.findFirst({ where: { userId: applicant2User.id } });
    assert(dbApp.status === 'PENDING', 'App not PENDING');

    // Restore admin cookie since we logged out earlier
    adminCookie = (await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@test.com', password: 'Password123!' }) })).headers.get('set-cookie').split(';')[0];

    // List apps
    res = await fetch(`${BASE_URL}/api/applications/list?page=1&limit=10`, { headers: { 'Cookie': adminCookie } });
    assert((await res.json()).data.some(a => a.id === dbApp.id), 'Admin could not list applications');

    // Approve
    res = await fetch(`${BASE_URL}/api/applications/${dbApp.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ status: 'APPROVED' })
    });
    assert(res.ok, 'Approval failed');
    dbApp = await prisma.application.findUnique({ where: { id: dbApp.id } });
    assert(dbApp.status === 'APPROVED', 'DB status not APPROVED');
    applicant2User = await prisma.user.findUnique({ where: { id: applicant2User.id } });
    assert(applicant2User.role === 'STUDENT', 'User role not upgraded to STUDENT');
    console.log('✅ Section 3: Application Pipeline passed');

    // We must login applicant2 as STUDENT to get new cookie with STUDENT role!
    studentCookie = (await fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'applicant2@test.com', password: 'Password123!' }) })).headers.get('set-cookie').split(';')[0];


    // --- 4. CAREER TRACKING ---
    let mentorUser = await prisma.user.findUnique({ where: { email: 'mentor@test.com' } });
    let studentUser = applicant2User; // Use the one we just approved
    
    // Assign mentor
    res = await fetch(`${BASE_URL}/api/career/assign-mentor`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ mentorId: mentorUser.id, studentId: studentUser.id })
    });
    assert(res.ok, 'Assign mentor failed');
    let msDb = await prisma.mentorStudent.findFirst({ where: { studentId: studentUser.id } });
    assert(msDb && msDb.mentorId === mentorUser.id, 'MentorStudent row not saved correctly');

    // Log skill
    res = await fetch(`${BASE_URL}/api/career/skill-progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': mentorCookie },
      body: JSON.stringify({ studentId: studentUser.id, skillName: 'React', level: 3 })
    });
    assert(res.ok, 'Log skill failed');
    let skillDb = await prisma.skillProgress.findFirst({ where: { studentId: studentUser.id } });
    assert(skillDb && skillDb.skillName === 'React', 'Skill not saved correctly');

    // Log employment
    res = await fetch(`${BASE_URL}/api/career/employment-record`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ studentId: studentUser.id, jobTitle: 'Dev1', company: 'Comp1', salaryBand: '50k', isCurrent: true })
    });
    assert(res.ok, 'Log employment 1 failed');
    let empDb = await prisma.employmentRecord.findFirst({ where: { studentId: studentUser.id } });
    assert(empDb && empDb.isCurrent === true, 'Employment not saved correctly');

    // Profile
    res = await fetch(`${BASE_URL}/api/career/student-profile?studentId=${studentUser.id}`, { headers: { 'Cookie': studentCookie } });
    let prof = await res.json();
    assert(prof.mentor && prof.skills.length > 0 && prof.employmentRecords.length > 0, 'Profile data incomplete');
    console.log('✅ Section 4: Career Tracking passed');

    // --- 5. ADMIN DASHBOARD ---
    res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { 'Cookie': adminCookie } });
    let dash = await res.json();
    let dashStudent = dash.data.find(u => u.id === studentUser.id);
    assert(dashStudent && dashStudent.mentor.mentor.email === 'mentor@test.com', 'Dashboard missing data');
    console.log('✅ Section 5: Admin Dashboard passed');

    // --- 6. CHATBOT ---
    res = await fetch(`${BASE_URL}/api/chatbot/query`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': studentCookie },
      body: JSON.stringify({ prompt: 'How do I pass my interview?' })
    });
    let chatRes = await res.json();
    assert(res.ok && chatRes.response.length > 10, 'Chatbot response failed');
    let chatDb = await prisma.chatbotQuery.findFirst({ where: { studentId: studentUser.id }, orderBy: { createdAt: 'desc' } });
    assert(chatDb && chatDb.response === chatRes.response, 'Chatbot query not saved');
    console.log('✅ Section 6: Chatbot passed');

    // --- 7. RECONCILIATION FLOW ---
    console.log('Starting reconciliation cron... This may take up to 20-30 seconds depending on Apify.');
    res = await fetch(`${BASE_URL}/api/reconciliation/cron-trigger`, { method: 'POST', headers: { 'Cookie': adminCookie } });
    let cronRes = await res.json();
    assert(res.ok, 'Cron trigger failed: ' + JSON.stringify(cronRes));
    
    // Wait a bit for webhook simulation...
    let recDb = await prisma.reconciliationAttempt.findFirst({ where: { studentId: studentUser.id }, orderBy: { createdAt: 'desc' } });
    assert(recDb && recDb.status === 'AWAITING_REPLY', 'Reconciliation attempt not created or wrong status');
    
    res = await fetch(`${BASE_URL}/api/reconciliation/webhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `From=${encodeURIComponent('whatsapp:+919867171270')}&Body=${encodeURIComponent('Yes, still a developer at Google now')}`
    });
    assert(res.ok, 'Webhook failed');
    console.log('✅ Section 7: Reconciliation Flow passed');

    console.log('\n✅✅ ALL TESTS PASSED ✅✅');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
