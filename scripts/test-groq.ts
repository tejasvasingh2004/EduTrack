import 'dotenv/config';
import { parseEmploymentReply, chatWithBot } from '../lib/llm/groq';

async function runTest() {
  console.log(`Testing Groq API integration...`);
  
  try {
    console.log('\n--- 1. Testing Chatbot Endpoint ---');
    const chatPrompt = "Hello! I just got my first job as a Junior Dev. What should I focus on in my first week?";
    console.log(`Prompt: "${chatPrompt}"`);
    const chatRes = await chatWithBot(chatPrompt);
    console.log(`\nResponse:\n${chatRes}`);

    console.log('\n--- 2. Testing Reply Parsing ---');
    const replyText = "Hi, yes I am still at Google but I got promoted to Senior Software Engineer. Salary is around 200k now.";
    console.log(`Reply Text: "${replyText}"`);
    const parseRes = await parseEmploymentReply(replyText);
    if (parseRes) {
      console.log('✅ Success! Extracted JSON Data:');
      console.log(JSON.stringify(parseRes, null, 2));
    } else {
      console.log('⚠️ Failed to extract or parse JSON from reply.');
    }
  } catch (error) {
    console.error('❌ Failed to run script:', error);
  }
}

runTest();
