import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authError = await requireRole(req, ["ADMIN"]);
    if (authError) return authError;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch all students (beneficiaries) with their mentor, employment, and skills count
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        linkedinUrl: true,
        mentor: {
          select: {
            mentor: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        employmentRecords: {
          where: { isCurrent: true },
          select: {
            jobTitle: true,
            company: true,
            salaryBand: true,
            updatedAt: true,
          }
        },
        _count: {
          select: { skills: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const total = await prisma.user.count({ where: { role: "STUDENT" } });

    return NextResponse.json({
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
