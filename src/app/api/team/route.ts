import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.teamMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clerkUserId } = body;

  if (!clerkUserId) {
    return NextResponse.json(
      { error: "Clerk user ID is required" },
      { status: 400 }
    );
  }

  const member = await prisma.teamMember.upsert({
    where: { clerkUserId },
    update: { isActive: true },
    create: { clerkUserId },
  });

  return NextResponse.json(member);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clerkUserId, isActive } = body;

  const member = await prisma.teamMember.update({
    where: { clerkUserId },
    data: { isActive },
  });

  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clerkUserId } = await req.json();
  await prisma.teamMember.delete({ where: { clerkUserId } });
  return NextResponse.json({ message: "Deleted" });
}
