export async function sendWhatsAppTemplate(to: string, jobTitle: string, company: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!sid || !token || !from) throw new Error('Twilio credentials not set');

  // MVP mock implementation:
  console.log(`[Twilio Mock] Sending template to ${to}: Is your job still ${jobTitle} at ${company}? Reply to update.`);
  return { success: true, messageSid: 'mock_sid' };
}
