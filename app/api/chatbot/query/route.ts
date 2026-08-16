import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { chatWithBot } from '@/lib/llm/groq';
import { z } from 'zod';

const ChatbotQuerySchema = z.object({ prompt: z.string().min(1) });

export async function POST(req: NextRequest) {
  const authRes = await requireRole(['STUDENT']);
  if (!authRes.authorized || !authRes.user) { return NextResponse.json({ error: authRes.error }, { status: 403 }); }

  try {
    const body = await req.json();
    const data = ChatbotQuerySchema.parse(body);

    const llmResponse = await chatWithBot(data.prompt);

    const record = await prisma.chatbotQuery.create({
      data: {
        studentId: authRes.user.userId,
        prompt: data.prompt,
        response: llmResponse,
      },
    });

    return NextResponse.json(record);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
