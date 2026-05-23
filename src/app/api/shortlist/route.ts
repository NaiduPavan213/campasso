import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all wishlisted colleges for logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: { college: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlists.map((s) => s.college));
}

// POST — add college to wishlist
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collegeId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const wishlist = await prisma.wishlist.create({
    data: { userId: user.id, collegeId },
  });

  return NextResponse.json(wishlist);
}

// DELETE — remove college from wishlist
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collegeId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.wishlist.delete({
    where: {
      userId_collegeId: { userId: user.id, collegeId },
    },
  });

  return NextResponse.json({ success: true });
}
