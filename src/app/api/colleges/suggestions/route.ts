import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    const colleges = await prisma.college.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        location: true,
        state: true,
        type: true,
      },
      take: 6,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json(colleges);
  } catch {
    return NextResponse.json([]);
  }
}
