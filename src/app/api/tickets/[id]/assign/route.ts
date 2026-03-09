import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { assignedToId } = body;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { assignedToId: assignedToId || null },
    include: { customer: true, labels: true },
  });

  return NextResponse.json(ticket);
}
