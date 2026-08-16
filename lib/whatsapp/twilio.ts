export async function sendWhatsAppTemplate(to: string, jobTitle: string, company: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  const templateSid = process.env.TWILIO_TEMPLATE_SID;

  if (!sid || !token || !from || !templateSid) throw new Error('Twilio credentials not set');

  const authString = Buffer.from(`${sid}:${token}`).toString('base64');
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const params = new URLSearchParams();
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+' + to}`;
  const fromFormatted = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  
  params.append('To', toFormatted);
  params.append('From', fromFormatted);
  params.append('ContentSid', templateSid);
  params.append('ContentVariables', JSON.stringify({ "1": jobTitle, "2": company }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Twilio API error: ${res.status} ${text}`);
  }
  return { success: true, messageSid: JSON.parse(text).sid };
}
