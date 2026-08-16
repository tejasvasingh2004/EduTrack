import { NextResponse } from "next/server";
import { ApplicationSubmitSchema } from "@/lib/validation/application.schema";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ApplicationSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, linkedinUrl, consentGiven } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User and Application in a single transaction
    const application = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          linkedinUrl,
          consentGiven,
          consentAt: new Date(),
          role: "APPLICANT",
        },
      });

      return tx.application.create({
        data: {
          userId: user.id,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
