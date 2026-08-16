import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { chatWithBot } from '@/lib/llm/groq';
import { chatbotQuerySchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const authRes = await requireRole(req, ['STUDENT']);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await req.json();
    const data = chatbotQuerySchema.parse(body);

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
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
