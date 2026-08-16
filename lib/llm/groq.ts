import OpenAI from 'openai';

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');
  
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};

const MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

export async function parseEmploymentReply(replyText: string) {
  try {
    const client = getClient();
    
    const prompt = `
    Extract the following information from the user's reply message:
    - jobTitle: the person's current job title
    - company: the company they work for
    - salaryBand: their salary band or exact salary, if mentioned (otherwise null)
    
    Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting or backticks:
    { "jobTitle": "string", "company": "string", "salaryBand": "string|null" }
    
    User Reply: "${replyText}"
    `;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.error(`[Groq Parser] Error parsing reply:`, error);
    return null; // Graceful fallback
  }
}

export async function chatWithBot(prompt: string) {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and encouraging career counselor for EduTrack.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const content = response.choices[0]?.message?.content;
    return content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error(`[Groq Chatbot] Error communicating with LLM:`, error);
    return "I'm currently experiencing high traffic or a temporary issue. Please try again later."; // Graceful fallback
  }
}
