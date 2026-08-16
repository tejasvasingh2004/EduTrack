import { SignJWT } from "jose";
import 'dotenv/config';

async function generateToken(userId, role) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod");
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

async function runApiTests() {
  const studentId = '47d36bdc-cf52-4a3c-bcac-f96c60263dda'; 
  const mentorId = '50d744b9-bed9-4977-b147-5f2f27424ae8'; 

  const studentToken = await generateToken(studentId, "STUDENT");
  const adminToken = await generateToken(mentorId, "ADMIN");
  
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${studentToken}`
  };

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${adminToken}`
  };

  console.log('\n--- 2. Career tracking API ---');
  
  // assign-mentor
  try {
    const res = await fetch('http://localhost:3001/api/career/assign-mentor', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ studentId, mentorId })
    });
    console.log('[POST /assign-mentor]', res.status, await res.text());
  } catch (e) { console.error('Error:', e) }

  // skill-progress
  try {
    const res = await fetch('http://localhost:3001/api/career/skill-progress', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ studentId, skillName: "React", level: 3 })
    });
    console.log('[POST /skill-progress]', res.status, await res.text());
  } catch (e) { console.error('Error:', e) }

  // employment-record
  try {
    const res = await fetch('http://localhost:3001/api/career/employment-record', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ studentId, company: "Google", jobTitle: "Junior Dev", salaryBand: "$100k-$120k" })
    });
    console.log('[POST /employment-record]', res.status, await res.text());
  } catch (e) { console.error('Error:', e) }

  // student-profile
  try {
    const res = await fetch(`http://localhost:3001/api/career/student-profile?studentId=${studentId}`, {
      method: 'GET',
      headers: studentHeaders
    });
    console.log('[GET /student-profile]', res.status, await res.text());
  } catch (e) { console.error('Error:', e) }

  console.log('\n--- 3. Chatbot API ---');
  try {
    const res = await fetch('http://localhost:3001/api/chatbot/query', {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ prompt: "What resources are available for resume help?" })
    });
    console.log('[POST /chatbot/query]', res.status, await res.text());
  } catch (e) { console.error('Error:', e) }
}

runApiTests();
