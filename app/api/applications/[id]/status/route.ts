import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { ApplicationStatusUpdateSchema } from "@/lib/validation/application.schema";
import { IdParamSchema } from "@/lib/validation/shared.schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const resolvedParams = await params;
    const idParsed = IdParamSchema.safeParse({ id: resolvedParams.id });
    if (!idParsed.success) {
      return NextResponse.json({ error: "Invalid Application ID" }, { status: 400 });
    }

    const body = await req.json();
    const bodyParsed = ApplicationStatusUpdateSchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: bodyParsed.error.format() },
        { status: 400 }
      );
    }

    const applicationId = idParsed.data.id;
    const { status } = bodyParsed.data;

    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update status and potentially user role in a single transaction
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: { status },
      });

      if (status === "APPROVED" && existingApplication.user.role !== "STUDENT") {
        await tx.user.update({
          where: { id: existingApplication.userId },
          data: { role: "STUDENT" },
        });
      }

      return app;
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
