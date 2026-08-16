import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { PaginationSchema } from "@/lib/validation/shared.schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page") || "1";
    const limitParam = url.searchParams.get("limit") || "10";

    const parsed = PaginationSchema.safeParse({
      page: pageParam,
      limit: limitParam,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid pagination params", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [total, applications] = await prisma.$transaction([
      prisma.application.count(),
      prisma.application.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              linkedinUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
