import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responses = await prisma.cannedResponse.findMany({
    orderBy: { title: "asc" },
  });
  return NextResponse.json(responses);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: responseBody } = body;

  if (!title || !responseBody) {
    return NextResponse.json(
      { error: "Title and body are required" },
      { status: 400 }
    );
  }

  const response = await prisma.cannedResponse.create({
    data: { title, body: responseBody },
  });

  return NextResponse.json(response);
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, body: responseBody } = body;

  const response = await prisma.cannedResponse.update({
    where: { id },
    data: { title, body: responseBody },
  });

  return NextResponse.json(response);
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.cannedResponse.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
