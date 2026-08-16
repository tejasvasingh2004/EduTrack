import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const payload = await refreshSession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized or token expired" }, { status: 401 });
    }

    return NextResponse.json({ message: "Session refreshed successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
